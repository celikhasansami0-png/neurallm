"""Outbound webhook delivery for tenant-configured integrations (e.g. Settings -> Webhook URL).

Delivery is best-effort: a failed or missing webhook URL never raises into the caller's
request/response cycle. Every attempt (success or failure) is written to audit_logs so it
shows up in Audit -> Replay.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

logger = logging.getLogger("quantum2.webhooks")


async def deliver(
    db: AsyncSession,
    *,
    tenant_id: str,
    webhook_url: str | None,
    event: str,
    data: dict,
    task_id: str | None = None,
) -> None:
    """POST a JSON event payload to the tenant's webhook URL, if one is configured."""
    if not webhook_url:
        return

    payload = {
        "tenant_id": tenant_id,
        "event": event,
        "data": data,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }

    status_code = None
    ok = False
    error = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(webhook_url, json=payload)
            status_code = resp.status_code
            ok = 200 <= resp.status_code < 300
    except Exception as exc:  # network errors, timeouts, DNS failures, etc.
        error = str(exc)
        logger.warning("Webhook delivery failed tenant=%s url=%s event=%s error=%s", tenant_id, webhook_url, event, error)

    db.add(AuditLog(
        tenant_id=tenant_id,
        task_id=task_id,
        actor="webhook",
        action=f"webhook.delivery.{event}",
        payload=payload,
        result={"ok": ok, "status_code": status_code, "error": error, "url": webhook_url},
        risk_level="low",
        replay_step=1,
        replay_total_steps=1,
    ))
    await db.commit()


async def test_delivery(url: str, event: str = "task.completed") -> dict:
    """Fire a one-off test POST (used by /api/v1/webhooks/test) without touching audit_logs."""
    sample_payload = {
        "event": event,
        "data": {"task_id": "sample-task-id", "status": "completed", "agent": "CEO", "completed_at": datetime.now(timezone.utc).isoformat()},
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=sample_payload)
            return {"ok": 200 <= resp.status_code < 300, "status_code": resp.status_code, "delivered_to": url, "event": event, "sample_payload": sample_payload}
    except Exception as exc:
        return {"ok": False, "status_code": None, "error": str(exc), "delivered_to": url, "event": event, "sample_payload": sample_payload}
