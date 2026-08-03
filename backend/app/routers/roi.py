from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.task import Task, ToolCall

router = APIRouter(prefix="/api/v1/roi", tags=["roi"])

# Rough cost model: assume each fully-automated task saves 20 minutes of human work at $60/hr.
MINUTES_SAVED_PER_TASK = 20
HOURLY_RATE_USD = 60


@router.get("")
async def get_roi(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    completed = await db.execute(
        select(func.count(Task.id)).where(Task.tenant_id == tenant_id, Task.status == "completed")
    )
    completed_count = completed.scalar_one() or 0

    tool_calls = await db.execute(select(func.count(ToolCall.id)).where(ToolCall.tenant_id == tenant_id))
    tool_call_count = tool_calls.scalar_one() or 0

    per_agent = await db.execute(
        select(ToolCall.agent_id, func.count(ToolCall.id)).where(ToolCall.tenant_id == tenant_id).group_by(ToolCall.agent_id)
    )
    breakdown = [{"agent_id": row[0], "actions_completed": row[1]} for row in per_agent.all()]

    hours_saved = round(completed_count * MINUTES_SAVED_PER_TASK / 60, 1)
    dollars_saved = round(hours_saved * HOURLY_RATE_USD, 2)

    return {
        "tasks_completed": completed_count,
        "tool_calls_executed": tool_call_count,
        "hours_saved": hours_saved,
        "estimated_dollars_saved": dollars_saved,
        "per_agent_breakdown": breakdown,
    }
