from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id, get_current_user
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.models.task import Task
from app.models.user import User
from app.services.approval_engine import score_risk

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


class TaskIn(BaseModel):
    agent_id: str
    title: str
    description: str = ""


class TaskOut(BaseModel):
    id: str
    agent_id: str
    title: str
    description: str
    status: str
    risk_level: str
    approved_by: str | None
    result: dict
    plan: list

    class Config:
        from_attributes = True


@router.post("", response_model=TaskOut)
async def create_task(
    payload: TaskIn,
    tenant_id: str = Depends(get_current_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    risk = score_risk(payload.title)
    status = "awaiting_approval" if risk == "high" else "pending"
    task = Task(
        tenant_id=tenant_id, agent_id=payload.agent_id, created_by=user.id,
        title=payload.title, description=payload.description, status=status, risk_level=risk,
    )
    db.add(task)
    await db.flush()

    agent_result = await db.execute(select(Agent).where(Agent.id == payload.agent_id))
    agent = agent_result.scalar_one_or_none()
    db.add(AuditLog(
        tenant_id=tenant_id, task_id=task.id, actor=agent.name if agent else "system",
        action="task.created", payload={"title": payload.title}, result={"status": status},
        risk_level=risk, replay_step=1, replay_total_steps=1,
    ))
    await db.commit()
    await db.refresh(task)
    return task


@router.get("", response_model=list[TaskOut])
async def list_tasks(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.tenant_id == tenant_id).order_by(Task.created_at.desc()))
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.tenant_id == tenant_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{task_id}/approve", response_model=TaskOut)
async def approve_task(
    task_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.tenant_id == tenant_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "approved"
    task.approved_by = user.id
    db.add(AuditLog(
        tenant_id=tenant_id, task_id=task.id, actor=user.email, action="task.approved",
        payload={}, result={"status": "approved"}, risk_level=task.risk_level,
        approved_by=user.email, replay_step=1, replay_total_steps=1,
    ))
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/reject", response_model=TaskOut)
async def reject_task(
    task_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.tenant_id == tenant_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "rejected"
    task.approved_by = user.id
    db.add(AuditLog(
        tenant_id=tenant_id, task_id=task.id, actor=user.email, action="task.rejected",
        payload={}, result={"status": "rejected"}, risk_level=task.risk_level,
        approved_by=user.email, replay_step=1, replay_total_steps=1,
    ))
    await db.commit()
    await db.refresh(task)
    return task
