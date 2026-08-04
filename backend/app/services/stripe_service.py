"""Thin wrapper around the Stripe SDK for subscription billing.

Stripe's `stripe` package is safe to import even without an API key, but every *call* into
the SDK is guarded behind `_require_configured()` so a missing STRIPE_SECRET_KEY never
crashes the app at import time or startup - it only raises when a billing endpoint is
actually invoked without the key configured.
"""
from __future__ import annotations

import stripe

from app.core.config import settings

PLAN_PRICE_ENV = {
    "team": "STRIPE_PRICE_TEAM",
    "business": "STRIPE_PRICE_BUSINESS",
}


def is_configured() -> bool:
    return bool(settings.STRIPE_SECRET_KEY)


def _require_configured() -> None:
    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError("Stripe is not configured")
    # Set lazily on every call rather than at import time, so rotating the key doesn't
    # require a process restart and importing this module never touches the network.
    stripe.api_key = settings.STRIPE_SECRET_KEY


def price_id_for_plan(plan: str) -> str:
    if plan not in PLAN_PRICE_ENV:
        raise ValueError(f"Unknown plan '{plan}'. Expected one of: {list(PLAN_PRICE_ENV)}")
    price_id = getattr(settings, PLAN_PRICE_ENV[plan])
    if not price_id:
        raise RuntimeError(f"Stripe price id for plan '{plan}' is not configured")
    return price_id


def create_checkout_session(
    *,
    plan: str,
    tenant_id: str,
    customer_email: str,
    stripe_customer_id: str | None,
    success_url: str,
    cancel_url: str,
    trial_days: int = 14,
) -> "stripe.checkout.Session":
    _require_configured()
    price_id = price_id_for_plan(plan)

    kwargs: dict = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "subscription_data": {"trial_period_days": trial_days},
        "client_reference_id": tenant_id,
        "metadata": {"tenant_id": tenant_id, "plan": plan},
    }
    if stripe_customer_id:
        kwargs["customer"] = stripe_customer_id
    else:
        kwargs["customer_email"] = customer_email

    return stripe.checkout.Session.create(**kwargs)


def construct_webhook_event(payload: bytes, sig_header: str) -> "stripe.Event":
    _require_configured()
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise RuntimeError("Stripe is not configured")
    return stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)


def get_subscription(subscription_id: str) -> "stripe.Subscription":
    _require_configured()
    return stripe.Subscription.retrieve(subscription_id)
