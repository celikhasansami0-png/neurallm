"""Thin wrapper around the Lemon Squeezy REST API for subscription billing.

Lemon Squeezy has no mature official server-side Python SDK, so this talks to their
JSON:API-style REST API directly over `httpx`. Every *call* is guarded behind
`_require_configured()` so a missing LEMONSQUEEZY_API_KEY never crashes the app at import
time or startup - it only raises when a billing endpoint is actually invoked without the
key configured.
"""
from __future__ import annotations

import hashlib
import hmac

import httpx

from app.core.config import settings

API_BASE = "https://api.lemonsqueezy.com/v1"

PLAN_VARIANT_ENV = {
    "team": "LEMONSQUEEZY_VARIANT_TEAM",
    "business": "LEMONSQUEEZY_VARIANT_BUSINESS",
}


def is_configured() -> bool:
    return bool(settings.LEMONSQUEEZY_API_KEY and settings.LEMONSQUEEZY_STORE_ID)


def _require_configured() -> None:
    if not settings.LEMONSQUEEZY_API_KEY or not settings.LEMONSQUEEZY_STORE_ID:
        raise RuntimeError("Lemon Squeezy is not configured")


def _headers() -> dict:
    return {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
    }


def variant_id_for_plan(plan: str) -> str:
    if plan not in PLAN_VARIANT_ENV:
        raise ValueError(f"Unknown plan '{plan}'. Expected one of: {list(PLAN_VARIANT_ENV)}")
    variant_id = getattr(settings, PLAN_VARIANT_ENV[plan])
    if not variant_id:
        raise RuntimeError(f"Lemon Squeezy variant id for plan '{plan}' is not configured")
    return variant_id


def create_checkout(
    *,
    plan: str,
    tenant_id: str,
    customer_email: str,
    success_url: str,
) -> str:
    """Creates a Lemon Squeezy checkout and returns the hosted checkout URL."""
    _require_configured()
    variant_id = variant_id_for_plan(plan)

    body = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "email": customer_email,
                    "custom": {"tenant_id": tenant_id, "plan": plan},
                },
                "checkout_options": {"embed": False},
                "product_options": {"redirect_url": success_url},
            },
            "relationships": {
                "store": {"data": {"type": "stores", "id": str(settings.LEMONSQUEEZY_STORE_ID)}},
                "variant": {"data": {"type": "variants", "id": str(variant_id)}},
            },
        }
    }

    with httpx.Client(timeout=15) as client:
        resp = client.post(f"{API_BASE}/checkouts", json=body, headers=_headers())
        resp.raise_for_status()
        data = resp.json()

    return data["data"]["attributes"]["url"]


def verify_webhook_signature(payload: bytes, signature_header: str) -> bool:
    """Lemon Squeezy signs webhooks with HMAC-SHA256 (hex digest) over the raw body,
    sent in the X-Signature header, keyed with LEMONSQUEEZY_WEBHOOK_SECRET."""
    if not settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        raise RuntimeError("Lemon Squeezy is not configured")
    if not signature_header:
        return False
    digest = hmac.new(
        settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(digest, signature_header)


def get_subscription(subscription_id: str) -> dict:
    _require_configured()
    with httpx.Client(timeout=15) as client:
        resp = client.get(f"{API_BASE}/subscriptions/{subscription_id}", headers=_headers())
        resp.raise_for_status()
        return resp.json()
