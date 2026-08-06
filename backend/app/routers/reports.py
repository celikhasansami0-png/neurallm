from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.order import Order
from app.models.cari import Cari
from app.models.payment import Payment
from app.models.shipment import Shipment

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/sales-by-customer")
async def sales_by_customer(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Cari.id, Cari.name, func.count(Order.id), func.coalesce(func.sum(Order.total), 0))
        .join(Order, Order.cari_id == Cari.id, isouter=True)
        .where(Cari.tenant_id == tenant_id)
        .group_by(Cari.id, Cari.name)
        .order_by(func.coalesce(func.sum(Order.total), 0).desc())
    )
    rows = result.all()
    return [{"cari_id": r[0], "cari_name": r[1], "order_count": r[2], "total": float(r[3])} for r in rows]


@router.get("/payment-status")
async def payment_status(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Payment.status, func.count(Payment.id), func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.tenant_id == tenant_id)
        .group_by(Payment.status)
    )
    rows = result.all()
    return [{"status": r[0], "count": r[1], "total": float(r[2])} for r in rows]


@router.get("/shipments")
async def shipment_report(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Shipment.status, func.count(Shipment.id))
        .where(Shipment.tenant_id == tenant_id)
        .group_by(Shipment.status)
    )
    rows = result.all()
    return [{"status": r[0], "count": r[1]} for r in rows]


@router.get("/outstanding")
async def outstanding_payments(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    """Vadesi geçmiş: payments still pending whose due_date has passed."""
    today = date.today()
    result = await db.execute(
        select(Payment)
        .where(Payment.tenant_id == tenant_id, Payment.status == "pending", Payment.due_date < today)
        .order_by(Payment.due_date)
    )
    rows = result.scalars().all()
    return [
        {
            "id": p.id, "order_id": p.order_id, "amount": float(p.amount), "currency": p.currency,
            "due_date": p.due_date, "days_overdue": (today - p.due_date).days if p.due_date else None,
        }
        for p in rows
    ]
