"""Thin wrapper around Composio's OAuth connect flow for the Integrations page.

Phratic has no AI agents, so this service only brokers OAuth connections between a
tenant and a third-party app (Gmail, Slack, HubSpot, ...) — it does not execute actions.
"""
from app.core.config import settings

try:
    from composio import ComposioToolSet  # type: ignore
except ImportError:  # composio not installed in this environment
    ComposioToolSet = None


class ComposioService:
    def __init__(self) -> None:
        self._toolset = None
        if ComposioToolSet and settings.COMPOSIO_API_KEY:
            self._toolset = ComposioToolSet(api_key=settings.COMPOSIO_API_KEY)

    def initiate_connection(self, tool_slug: str, tenant_id: str) -> dict:
        """Kick off an OAuth connection for a tool. Returns a redirect_url the frontend opens."""
        if not self._toolset:
            return {
                "redirect_url": f"https://backend.composio.dev/connect/{tool_slug}?entity={tenant_id}",
                "status": "pending",
            }
        entity = self._toolset.get_entity(id=tenant_id)
        connection = entity.initiate_connection(app_name=tool_slug)
        return {"redirect_url": connection.redirectUrl, "status": "pending"}

    def is_live(self) -> bool:
        return self._toolset is not None


composio_service = ComposioService()
