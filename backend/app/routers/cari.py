from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import delete, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.cari import Cari
from app.models.order import Order

router = APIRouter(prefix="/api/v1/cariler", tags=["cariler"])


class CariIn(BaseModel):
    type: str = "customer"
    name: str
    contact_name: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    tax_number: str = ""
    payment_terms: str = ""
    credit_limit: float = 0
    currency: str = "TRY"


class CariOut(CariIn):
    id: str
    balance: float
    is_active: bool

    class Config:
        from_attributes = True


@router.get("", response_model=list[CariOut])
async def list_cariler(
    type: str | None = Query(default=None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Cari).where(Cari.tenant_id == tenant_id).order_by(Cari.name)
    if type:
        stmt = stmt.where(Cari.type == type)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=CariOut)
async def create_cari(payload: CariIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    cari = Cari(tenant_id=tenant_id, **payload.model_dump())
    db.add(cari)
    await db.commit()
    await db.refresh(cari)
    return cari


@router.get("/{cari_id}", response_model=CariOut)
async def get_cari(cari_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cari).where(Cari.id == cari_id, Cari.tenant_id == tenant_id))
    cari = result.scalar_one_or_none()
    if not cari:
        raise HTTPException(status_code=404, detail="Cari not found")
    return cari


@router.put("/{cari_id}", response_model=CariOut)
async def update_cari(
    cari_id: str, payload: CariIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Cari).where(Cari.id == cari_id, Cari.tenant_id == tenant_id))
    cari = result.scalar_one_or_none()
    if not cari:
        raise HTTPException(status_code=404, detail="Cari not found")
    for field, value in payload.model_dump().items():
        setattr(cari, field, value)
    await db.commit()
    await db.refresh(cari)
    return cari


@router.delete("/{cari_id}")
async def delete_cari(cari_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Cari).where(Cari.id == cari_id, Cari.tenant_id == tenant_id))
    await db.commit()
    return {"ok": True}


@router.get("/{cari_id}/statement")
async def account_statement(cari_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    """Hesap Ekstresi: every order for this cari with running total."""
    result = await db.execute(
        select(Order).where(Order.cari_id == cari_id, Order.tenant_id == tenant_id).order_by(Order.created_at)
    )
    orders = result.scalars().all()
    running = 0.0
    rows = []
    for o in orders:
        running += float(o.total)
        rows.append({
            "order_id": o.id, "order_number": o.order_number, "date": o.created_at,
            "status": o.status, "amount": float(o.total), "running_balance": running,
        })
    return {"cari_id": cari_id, "entries": rows, "outstanding": running}
