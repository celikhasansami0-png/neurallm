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
from app.services import lemonsqueezy_service

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
    if not lemonsqueezy_service.is_configured():
        raise HTTPException(status_code=503, detail="Billing is not configured on this server yet.")

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    try:
        checkout_url = lemonsqueezy_service.create_checkout(
            plan=payload.plan,
            tenant_id=tenant_id,
            customer_email=user.email,
            success_url=f"{settings.FRONTEND_URL}/settings?checkout=success",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=502, detail="Could not create checkout with billing provider")

    return {"checkout_url": checkout_url}


@router.post("/webhook")
async def lemonsqueezy_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not lemonsqueezy_service.is_configured():
        raise HTTPException(status_code=503, detail="Billing is not configured on this server yet.")

    payload = await request.body()
    signature = request.headers.get("x-signature", "")
    try:
        valid = lemonsqueezy_service.verify_webhook_signature(payload, signature)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid Lemon Squeezy webhook signature")

    import json

    event = json.loads(payload)
    event_name = (event.get("meta") or {}).get("event_name", "")
    custom_data = (event.get("meta") or {}).get("custom_data") or {}
    obj = (event.get("data") or {}).get("attributes") or {}
    obj_id = (event.get("data") or {}).get("id")

    if event_name == "subscription_created":
        tenant_id = custom_data.get("tenant_id")
        plan = custom_data.get("plan", "team")
        if tenant_id:
            result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
            tenant = result.scalar_one_or_none()
            if tenant:
                tenant.lemonsqueezy_customer_id = str(obj.get("customer_id") or tenant.lemonsqueezy_customer_id or "")
                tenant.lemonsqueezy_subscription_id = str(obj_id or tenant.lemonsqueezy_subscription_id or "")
                tenant.plan = plan
                tenant.subscription_status = obj.get("status", "trialing")
                if obj.get("trial_ends_at"):
                    try:
                        tenant.trial_ends_at = datetime.fromisoformat(obj["trial_ends_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass
                await db.commit()

    elif event_name in ("subscription_updated", "subscription_cancelled", "subscription_expired"):
        subscription_id = str(obj_id or "")
        customer_id = str(obj.get("customer_id") or "")
        result = await db.execute(
            select(Tenant).where(
                (Tenant.lemonsqueezy_subscription_id == subscription_id)
                | (Tenant.lemonsqueezy_customer_id == customer_id)
            )
        )
        tenant = result.scalar_one_or_none()
        if tenant:
            if event_name in ("subscription_cancelled", "subscription_expired"):
                tenant.subscription_status = "canceled"
                tenant.plan = "trial"
            else:
                tenant.subscription_status = obj.get("status", tenant.subscription_status)
                if obj.get("trial_ends_at"):
                    try:
                        tenant.trial_ends_at = datetime.fromisoformat(obj["trial_ends_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass
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
        "billing_configured": lemonsqueezy_service.is_configured(),
    }
