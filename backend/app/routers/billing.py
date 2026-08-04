from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_tenant_id, get_current_user
from app.models.tenant import Tenant
from app.models.user import User
from app.services import stripe_service

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

PLAN_LABELS = {"team": "Team", "business": "Business"}


class CheckoutIn(BaseModel):
    plan: str  # "team" | "business"


@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CheckoutIn,
    tenant_id: str = Depends(get_current_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.plan not in PLAN_LABELS:
        raise HTTPException(status_code=400, detail="plan must be 'team' or 'business'")
    if not stripe_service.is_configured():
        raise HTTPException(status_code=503, detail="Stripe is not configured on this server yet.")

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    try:
        session = stripe_service.create_checkout_session(
            plan=payload.plan,
            tenant_id=tenant_id,
            customer_email=user.email,
            stripe_customer_id=tenant.stripe_customer_id,
            success_url=f"{settings.FRONTEND_URL}/settings?checkout=success",
            cancel_url=f"{settings.FRONTEND_URL}/settings?checkout=cancelled",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not stripe_service.is_configured():
        raise HTTPException(status_code=503, detail="Stripe is not configured on this server yet.")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        tenant_id = obj.get("client_reference_id") or (obj.get("metadata") or {}).get("tenant_id")
        plan = (obj.get("metadata") or {}).get("plan", "team")
        if tenant_id:
            result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
            tenant = result.scalar_one_or_none()
            if tenant:
                tenant.stripe_customer_id = obj.get("customer") or tenant.stripe_customer_id
                tenant.stripe_subscription_id = obj.get("subscription") or tenant.stripe_subscription_id
                tenant.plan = plan
                tenant.subscription_status = "trialing"
                await db.commit()

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        subscription_id = obj.get("id")
        customer_id = obj.get("customer")
        result = await db.execute(
            select(Tenant).where(
                (Tenant.stripe_subscription_id == subscription_id) | (Tenant.stripe_customer_id == customer_id)
            )
        )
        tenant = result.scalar_one_or_none()
        if tenant:
            if event_type == "customer.subscription.deleted":
                tenant.subscription_status = "canceled"
                tenant.plan = "trial"
            else:
                tenant.subscription_status = obj.get("status", tenant.subscription_status)
                if obj.get("trial_end"):
                    tenant.trial_ends_at = datetime.fromtimestamp(obj["trial_end"], tz=timezone.utc)
            await db.commit()

    return {"received": True}


@router.get("/status")
async def billing_status(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {
        "plan": tenant.plan,
        "subscription_status": tenant.subscription_status,
        "trial_ends_at": tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None,
        "stripe_configured": stripe_service.is_configured(),
    }
