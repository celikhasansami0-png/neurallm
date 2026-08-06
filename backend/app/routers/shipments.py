from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.shipment import Shipment

router = APIRouter(prefix="/api/v1/shipments", tags=["shipments"])

# address_type: santiye | depo | acik_adres
# delivery_time: acil | fabrikaya_bagli | tarihli
# status: pending | preparing | shipped | delivered


class ShipmentIn(BaseModel):
    order_id: str
    address_type: str = "acik_adres"
    address_text: str = ""
    city: str = ""
    district: str = ""
    delivery_time: str = "tarihli"
    delivery_date: date | None = None
    recipient_name: str = ""
    recipient_phone: str = ""


class ShipmentOut(ShipmentIn):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[ShipmentOut])
async def list_shipments(
    status: str | None = Query(default=None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Shipment).where(Shipment.tenant_id == tenant_id).order_by(Shipment.created_at.desc())
    if status:
        stmt = stmt.where(Shipment.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=ShipmentOut)
async def create_shipment(payload: ShipmentIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    shipment = Shipment(tenant_id=tenant_id, **payload.model_dump())
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.get("/{shipment_id}", response_model=ShipmentOut)
async def get_shipment(shipment_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id, Shipment.tenant_id == tenant_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


class ShipmentStatusIn(BaseModel):
    status: str


@router.put("/{shipment_id}/status", response_model=ShipmentOut)
async def update_shipment_status(
    shipment_id: str, payload: ShipmentStatusIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    valid = {"pending", "preparing", "shipped", "delivered"}
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail=f"status must be one of {valid}")
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id, Shipment.tenant_id == tenant_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.status = payload.status
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id, Shipment.tenant_id == tenant_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    await db.delete(shipment)
    await db.commit()
    return {"ok": True}
