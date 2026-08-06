from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id, get_current_user
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.payment import Payment
from app.models.user import User

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])

# status: draft | confirmed | shipped | invoiced
# payment_method: cash | credit_card | deferred
DEFERRED_DAYS_CHOICES = {60, 90, 120, 150}
INSTALLMENT_CHOICES = {"tek_cekim", "3", "5", "7"}


class OrderItemIn(BaseModel):
    product_id: str
    quantity: float
    unit_price: float | None = None  # falls back to product price if omitted


class OrderItemOut(BaseModel):
    id: str
    product_id: str
    quantity: float
    unit_price: float
    tax_rate: float
    line_total: float

    class Config:
        from_attributes = True


class OrderIn(BaseModel):
    cari_id: str
    payment_method: str = "cash"
    installment: str = ""
    deferred_days: int | None = None
    currency: str = "TRY"
    notes: str = ""
    items: list[OrderItemIn] = []


class OrderOut(BaseModel):
    id: str
    order_number: str
    cari_id: str
    status: str
    payment_method: str
    installment: str
    deferred_days: int | None
    currency: str
    subtotal: float
    tax_total: float
    total: float
    notes: str
    created_at: datetime
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True


async def _next_order_number(db: AsyncSession, tenant_id: str) -> str:
    year = datetime.utcnow().year
    result = await db.execute(select(func.count()).select_from(Order).where(Order.tenant_id == tenant_id))
    count = (result.scalar() or 0) + 1
    return f"SP-{year}-{count:04d}"


@router.get("", response_model=list[OrderOut])
async def list_orders(
    status: str | None = Query(default=None),
    cari_id: str | None = Query(default=None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).where(Order.tenant_id == tenant_id).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    if cari_id:
        stmt = stmt.where(Order.cari_id == cari_id)
    result = await db.execute(stmt)
    orders = result.scalars().all()
    out = []
    for o in orders:
        items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == o.id))
        items = items_result.scalars().all()
        out.append(OrderOut(**{**o.__dict__, "items": items}))
    return out


@router.post("", response_model=OrderOut)
async def create_order(
    payload: OrderIn,
    tenant_id: str = Depends(get_current_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.payment_method == "credit_card" and payload.installment and payload.installment not in INSTALLMENT_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid installment option")
    if payload.payment_method == "deferred" and payload.deferred_days not in DEFERRED_DAYS_CHOICES:
        raise HTTPException(status_code=400, detail="Invalid deferred_days option (must be 60/90/120/150)")

    order_number = await _next_order_number(db, tenant_id)
    order = Order(
        tenant_id=tenant_id,
        order_number=order_number,
        cari_id=payload.cari_id,
        created_by=user.id,
        status="draft",
        payment_method=payload.payment_method,
        installment=payload.installment,
        deferred_days=payload.deferred_days,
        currency=payload.currency,
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    subtotal = 0.0
    tax_total = 0.0
    items: list[OrderItem] = []
    for item_in in payload.items:
        result = await db.execute(select(Product).where(Product.id == item_in.product_id, Product.tenant_id == tenant_id))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")
        unit_price = item_in.unit_price if item_in.unit_price is not None else float(product.price)
        line_subtotal = unit_price * item_in.quantity
        line_tax = line_subtotal * (float(product.tax_rate) / 100)
        subtotal += line_subtotal
        tax_total += line_tax
        item = OrderItem(
            tenant_id=tenant_id, order_id=order.id, product_id=product.id,
            quantity=item_in.quantity, unit_price=unit_price, tax_rate=product.tax_rate,
            line_total=line_subtotal + line_tax,
        )
        db.add(item)
        items.append(item)

    order.subtotal = subtotal
    order.tax_total = tax_total
    order.total = subtotal + tax_total
    await db.commit()
    await db.refresh(order)
    return OrderOut(**{**order.__dict__, "items": items})


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id, Order.tenant_id == tenant_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = items_result.scalars().all()
    return OrderOut(**{**order.__dict__, "items": items})


class StatusIn(BaseModel):
    status: str  # draft | confirmed | shipped | invoiced


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: str, payload: StatusIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    valid = {"draft", "confirmed", "shipped", "invoiced"}
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail=f"status must be one of {valid}")
    result = await db.execute(select(Order).where(Order.id == order_id, Order.tenant_id == tenant_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = items_result.scalars().all()
    return OrderOut(**{**order.__dict__, "items": items})


@router.delete("/{order_id}")
async def delete_order(order_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id, Order.tenant_id == tenant_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.delete(order)
    await db.commit()
    return {"ok": True}
