"""Recurring-task cron scheduler.

Runs an AsyncIOScheduler job every 5 minutes that scans `recurring_tasks` for rows whose
cron_expression is due (via croniter), creates+runs a real Task through the same
orchestrator/executor path used by the manual task-creation endpoint, and stamps
`last_run_at`. Started on FastAPI startup, shut down cleanly on FastAPI shutdown.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from croniter import croniter
from sqlalchemy import select

from app.core.db import AsyncSessionLocal
from app.models.agent import Agent
from app.models.recurring_task import RecurringTask
from app.models.task import Task
from app.models.user import User
from app.services.approval_engine import score_risk
from app.services.orchestrator import run_task_to_completion

logger = logging.getLogger("quantum2.scheduler")

_scheduler: AsyncIOScheduler | None = None


def _is_due(cron_expression: str, last_run_at: str | None, now: datetime) -> bool:
    """A recurring task is due if it has never run, or if its next scheduled fire time
    (computed from the last run) has already passed."""
    if not last_run_at:
        return True
    try:
        base = datetime.fromisoformat(last_run_at)
        if base.tzinfo is None:
            base = base.replace(tzinfo=timezone.utc)
        next_fire = croniter(cron_expression, base).get_next(datetime)
        return next_fire <= now
    except Exception:
        logger.warning("Skipping recurring task with invalid cron_expression=%r", cron_expression)
        return False


async def run_due_recurring_tasks() -> None:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(RecurringTask).where(RecurringTask.is_active.is_(True)))
        items = result.scalars().all()

        for item in items:
            if not _is_due(item.cron_expression, item.last_run_at, now):
                continue

            agent_result = await db.execute(select(Agent).where(Agent.id == item.agent_id))
            agent = agent_result.scalar_one_or_none()
            if not agent:
                logger.warning("Recurring task %s references missing agent %s", item.id, item.agent_id)
                continue

            user_result = await db.execute(select(User).where(User.tenant_id == item.tenant_id).limit(1))
            user = user_result.scalar_one_or_none()
            if not user:
                logger.warning("Recurring task %s has no user to attribute task creation to", item.id)
                continue

            try:
                risk = score_risk(item.title)
                task = Task(
                    tenant_id=item.tenant_id, agent_id=item.agent_id, created_by=user.id,
                    title=item.title, description=item.prompt,
                    status="awaiting_approval" if risk == "high" else "pending", risk_level=risk,
                )
                db.add(task)
                await db.flush()
                if task.status == "pending":
                    await run_task_to_completion(db, task, agent, item.tenant_id)
                item.last_run_at = now.isoformat()
                await db.commit()
                logger.info("Ran recurring task %s (%s) -> task %s", item.id, item.title, task.id)
            except Exception:
                logger.exception("Failed to run recurring task %s", item.id)
                await db.rollback()


def start_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = AsyncIOScheduler(timezone=timezone.utc)
    _scheduler.add_job(
        run_due_recurring_tasks, "interval", minutes=5, id="recurring_tasks",
        next_run_time=datetime.now(timezone.utc), max_instances=1,
    )
    _scheduler.start()
    logger.info("Recurring-task scheduler started (checks every 5 minutes).")


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Recurring-task scheduler stopped.")
