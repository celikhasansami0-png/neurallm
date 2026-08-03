from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_tenant_id

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


class WebhookTestIn(BaseModel):
    url: str
    event: str = "task.completed"


@router.post("/test")
async def test_webhook(payload: WebhookTestIn, tenant_id: str = Depends(get_current_tenant_id)):
    # TODO: replace with a real outbound POST (httpx) once a webhook URL is configured in Settings.
    return {
        "ok": True,
        "delivered_to": payload.url,
        "event": payload.event,
        "sample_payload": {"tenant_id": tenant_id, "event": payload.event, "data": {"task_id": "sample-task-id"}},
    }
