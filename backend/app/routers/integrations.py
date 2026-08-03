from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.integration_connection import IntegrationConnection
from app.services.composio_service import composio_service

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


class ConnectIn(BaseModel):
    tool_slug: str
    display_name: str
    category: str = "productivity"


class IntegrationOut(BaseModel):
    id: str
    tool_slug: str
    display_name: str
    category: str
    status: str

    class Config:
        from_attributes = True


@router.get("", response_model=list[IntegrationOut])
async def list_integrations(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IntegrationConnection).where(IntegrationConnection.tenant_id == tenant_id))
    return result.scalars().all()


@router.post("/connect")
async def connect_integration(
    payload: ConnectIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    oauth = composio_service.initiate_connection(payload.tool_slug, tenant_id)
    conn = IntegrationConnection(
        tenant_id=tenant_id, tool_slug=payload.tool_slug, display_name=payload.display_name,
        category=payload.category, status="pending",
    )
    db.add(conn)
    await db.commit()
    await db.refresh(conn)
    return {"connection_id": conn.id, "redirect_url": oauth["redirect_url"]}


@router.delete("/{integration_id}")
async def disconnect_integration(
    integration_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    await db.execute(
        delete(IntegrationConnection).where(
            IntegrationConnection.id == integration_id, IntegrationConnection.tenant_id == tenant_id
        )
    )
    await db.commit()
    return {"ok": True}
