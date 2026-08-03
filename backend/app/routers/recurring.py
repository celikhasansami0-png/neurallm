from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.recurring_task import RecurringTask

router = APIRouter(prefix="/api/v1/recurring", tags=["recurring"])


class RecurringIn(BaseModel):
    agent_id: str
    title: str
    prompt: str = ""
    cron_expression: str = "0 9 * * 1"
    is_active: bool = True


class RecurringOut(RecurringIn):
    id: str
    last_run_at: str | None

    class Config:
        from_attributes = True


@router.get("", response_model=list[RecurringOut])
async def list_recurring(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RecurringTask).where(RecurringTask.tenant_id == tenant_id))
    return result.scalars().all()


@router.post("", response_model=RecurringOut)
async def create_recurring(
    payload: RecurringIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    item = RecurringTask(tenant_id=tenant_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{item_id}", response_model=RecurringOut)
async def update_recurring(
    item_id: str, payload: RecurringIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(RecurringTask).where(RecurringTask.id == item_id, RecurringTask.tenant_id == tenant_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring task not found")
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}")
async def delete_recurring(item_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(RecurringTask).where(RecurringTask.id == item_id, RecurringTask.tenant_id == tenant_id))
    await db.commit()
    return {"ok": True}
