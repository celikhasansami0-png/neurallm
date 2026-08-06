from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.document import Document
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.cari import Cari
from app.models.payment import Payment
from app.models.tenant import Tenant
from app.services.pdf_service import render_document_pdf

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

DOC_PREFIX = {"irsaliye": "IRS", "fatura": "FAT"}


class DocumentOut(BaseModel):
    id: str
    order_id: str
    doc_type: str
    doc_number: str
    issued_at: datetime

    class Config:
        from_attributes = True


async def _next_doc_number(db: AsyncSession, tenant_id: str, doc_type: str) -> str:
    year = datetime.utcnow().year
    result = await db.execute(
        select(func.count()).select_from(Document).where(Document.tenant_id == tenant_id, Document.doc_type == doc_type)
    )
    count = (result.scalar() or 0) + 1
    return f"{DOC_PREFIX.get(doc_type, 'DOC')}-{year}-{count:04d}"


class DocumentIn(BaseModel):
    order_id: str
    doc_type: str  # irsaliye | fatura


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    order_id: str | None = Query(default=None),
    doc_type: str | None = Query(default=None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Document).where(Document.tenant_id == tenant_id).order_by(Document.issued_at.desc())
    if order_id:
        stmt = stmt.where(Document.order_id == order_id)
    if doc_type:
        stmt = stmt.where(Document.doc_type == doc_type)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=DocumentOut)
async def create_document(payload: DocumentIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    if payload.doc_type not in DOC_PREFIX:
        raise HTTPException(status_code=400, detail="doc_type must be irsaliye or fatura")
    result = await db.execute(select(Order).where(Order.id == payload.order_id, Order.tenant_id == tenant_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    doc_number = await _next_doc_number(db, tenant_id, payload.doc_type)
    document = Document(tenant_id=tenant_id, order_id=order.id, doc_type=payload.doc_type, doc_number=doc_number)
    db.add(document)
    if payload.doc_type == "fatura" and order.status != "invoiced":
        order.status = "invoiced"
    await db.commit()
    await db.refresh(document)
    return document


@router.get("/{document_id}/pdf")
async def download_document_pdf(document_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id, Document.tenant_id == tenant_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    order_result = await db.execute(select(Order).where(Order.id == document.order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cari_result = await db.execute(select(Cari).where(Cari.id == order.cari_id))
    cari = cari_result.scalar_one_or_none()

    tenant_result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_result.scalar_one_or_none()

    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    order_items = items_result.scalars().all()

    items_payload = []
    for oi in order_items:
        product_result = await db.execute(select(Product).where(Product.id == oi.product_id))
        product = product_result.scalar_one_or_none()
        items_payload.append({
            "name": product.name if product else "",
            "quantity": float(oi.quantity),
            "unit": product.unit if product else "",
            "unit_price": float(oi.unit_price),
            "tax_rate": float(oi.tax_rate),
            "line_total": float(oi.line_total),
        })

    pdf_bytes = render_document_pdf(
        doc_type=document.doc_type,
        doc_number=document.doc_number,
        company_name=tenant.name if tenant else "Phratic",
        cari_name=cari.name if cari else "",
        cari_address=cari.address if cari else "",
        cari_tax_number=cari.tax_number if cari else "",
        order_number=order.order_number,
        issued_at=document.issued_at.strftime("%d.%m.%Y"),
        items=items_payload,
        currency=order.currency,
        subtotal=float(order.subtotal),
        tax_total=float(order.tax_total),
        total=float(order.total),
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{document.doc_number}.pdf"'},
    )


# ========== Payments ==========

class PaymentIn(BaseModel):
    order_id: str
    amount: float
    currency: str = "TRY"
    method: str = "cash"
    due_date: date | None = None


class PaymentOut(PaymentIn):
    id: str
    status: str
    paid_at: datetime | None

    class Config:
        from_attributes = True


@router.get("/payments/list", response_model=list[PaymentOut])
async def list_payments(
    status: str | None = Query(default=None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Payment).where(Payment.tenant_id == tenant_id).order_by(Payment.created_at.desc())
    if status:
        stmt = stmt.where(Payment.status == status)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/payments", response_model=PaymentOut)
async def create_payment(payload: PaymentIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    payment = Payment(tenant_id=tenant_id, **payload.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.put("/payments/{payment_id}/mark-paid", response_model=PaymentOut)
async def mark_payment_paid(payment_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).where(Payment.id == payment_id, Payment.tenant_id == tenant_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "paid"
    payment.paid_at = datetime.utcnow()
    await db.commit()
    await db.refresh(payment)
    return payment
