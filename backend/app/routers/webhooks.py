from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.tenant import Tenant
from app.services import webhook_service

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


class WebhookTestIn(BaseModel):
    url: str | None = None
    event: str = "task.completed"


class WebhookConfigIn(BaseModel):
    webhook_url: str


@router.get("/config")
async def get_webhook_config(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"webhook_url": tenant.webhook_url}


@router.put("/config")
async def set_webhook_config(
    payload: WebhookConfigIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant.webhook_url = payload.webhook_url
    await db.commit()
    return {"webhook_url": tenant.webhook_url}


@router.post("/test")
async def test_webhook(
    payload: WebhookTestIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    url = payload.url
    if not url:
        result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
        tenant = result.scalar_one_or_none()
        url = tenant.webhook_url if tenant else None
    if not url:
        raise HTTPException(status_code=400, detail="No webhook URL configured. Pass one or save it under Settings first.")

    delivery = await webhook_service.test_delivery(url, event=payload.event)
    delivery["tenant_id"] = tenant_id
    return delivery
