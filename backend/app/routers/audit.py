from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


class AuditOut(BaseModel):
    id: str
    task_id: str | None
    actor: str
    action: str
    payload: dict
    result: dict
    risk_level: str
    approved_by: str | None
    replay_step: int
    replay_total_steps: int

    class Config:
        from_attributes = True


@router.get("", response_model=list[AuditOut])
async def list_audit(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).where(AuditLog.tenant_id == tenant_id).order_by(AuditLog.created_at.desc()))
    return result.scalars().all()


@router.get("/{task_id}/replay")
async def replay_task(task_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AuditLog).where(AuditLog.task_id == task_id, AuditLog.tenant_id == tenant_id).order_by(AuditLog.replay_step)
    )
    entries = result.scalars().all()
    if not entries:
        raise HTTPException(status_code=404, detail="No audit trail for this task")
    return {
        "task_id": task_id,
        "steps": [
            {
                "step": e.replay_step, "total_steps": e.replay_total_steps, "actor": e.actor,
                "action": e.action, "payload": e.payload, "result": e.result,
                "risk_level": e.risk_level, "timestamp": e.created_at.isoformat(),
            }
            for e in entries
        ],
    }
