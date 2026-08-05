"""Layer 2: Orchestrator.

Given a routed request and the target agent, plans a multi-step execution using Groq
llama-3.3-70b-versatile, then hands each step to an Executor. This module owns the
plan -> execute -> log loop; individual tool calls are performed by executors using the
tools attached to their agent (see composio_service.py).
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone

from groq import Groq
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.models.task import Task, ToolCall
from app.models.tenant import Tenant
from app.services.executor import execute_step
from app.services import webhook_service

SYSTEM_PROMPT_TEMPLATE = """You are the orchestrator for {agent_name}, who holds the position
of {org_position} inside a company's AI operating system called Managent. Break the user's
request into a short, concrete step-by-step plan using only these allowed tools: {tools}.
Never propose an action outside this agent's IAM scope. Return the plan as a numbered list."""


@dataclass
class PlanStep:
    step: int
    description: str
    tool: str | None = None


@dataclass
class Plan:
    steps: list[PlanStep] = field(default_factory=list)


def _client() -> Groq | None:
    if not settings.GROQ_API_KEY:
        return None
    return Groq(api_key=settings.GROQ_API_KEY)


async def plan_task(agent_name: str, org_position: str, allowed_tools: list[str], request: str) -> Plan:
    client = _client()
    if client is None:
        # No live Groq key configured - deterministic single-step plan so the pipeline still runs.
        return Plan(steps=[PlanStep(step=1, description=request, tool=allowed_tools[0] if allowed_tools else None)])

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        agent_name=agent_name, org_position=org_position, tools=", ".join(allowed_tools)
    )
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request},
        ],
        temperature=0.2,
    )
    text = completion.choices[0].message.content or ""
    steps = [
        PlanStep(step=i + 1, description=line.strip())
        for i, line in enumerate(text.splitlines())
        if line.strip()
    ]
    return Plan(steps=steps or [PlanStep(step=1, description=request)])


async def run_task_to_completion(db: AsyncSession, task: Task, agent: Agent, tenant_id: str) -> Task:
    """Plans and executes a task end to end (Layer 2 -> Layer 3), then logs + notifies.

    Used right after a task is created (when it doesn't need approval) and right after a
    human approves a previously-paused task. Never raises: any failure flips the task to
    'failed' with the error captured in task.result so the API caller still gets a clean
    response.
    """
    try:
        plan = await plan_task(agent.name, agent.org_position, agent.allowed_tools, f"{task.title}. {task.description}")
        task.plan = [{"step": s.step, "description": s.description, "tool": s.tool} for s in plan.steps]

        already_approved = bool(task.approved_by)
        step_outputs = []
        for i, step in enumerate(plan.steps):
            tool_name = step.tool or (agent.allowed_tools[0] if agent.allowed_tools else "directives")
            result = await execute_step(
                agent_name=agent.name, tool_name=tool_name, integration="", input_payload={"description": step.description},
                tenant_id=tenant_id, already_approved=already_approved,
            )
            db.add(ToolCall(
                tenant_id=tenant_id, task_id=task.id, agent_id=agent.id, tool_name=result.tool_name,
                integration=result.integration, input_payload={"description": step.description},
                output_payload=result.output, status=result.status,
            ))
            step_outputs.append({"step": i + 1, "tool": result.tool_name, "status": result.status, "output": result.output})
            db.add(AuditLog(
                tenant_id=tenant_id, task_id=task.id, actor=agent.name, action=f"tool.{result.tool_name}",
                payload={"description": step.description}, result=result.output, risk_level=result.risk_level,
                replay_step=i + 1, replay_total_steps=len(plan.steps),
            ))
            if result.status == "awaiting_approval":
                task.status = "awaiting_approval"
                task.result = {"steps": step_outputs}
                await db.commit()
                await db.refresh(task)
                return task

        task.status = "completed"
        task.result = {"steps": step_outputs}
        await db.commit()
        await db.refresh(task)

        tenant_result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
        tenant_row = tenant_result.scalar_one_or_none()
        webhook_url = tenant_row.webhook_url if tenant_row else None
        await webhook_service.deliver(
            db, tenant_id=tenant_id, webhook_url=webhook_url, event="task.completed",
            data={"task_id": task.id, "status": task.status, "agent": agent.name, "completed_at": datetime.now(timezone.utc).isoformat()},
            task_id=task.id,
        )
        return task
    except Exception as exc:
        task.status = "failed"
        task.result = {"error": str(exc)}
        await db.commit()
        await db.refresh(task)
        return task
