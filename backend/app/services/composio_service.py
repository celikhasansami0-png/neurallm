"""Wraps composio_langchain to expose OAuth-connected tools to executor agents.

Composio brokers the actual OAuth flow. This service is the single seam the rest of the
backend calls through, so swapping providers later only touches this file.
"""
from app.core.config import settings

try:
    from composio_langchain import ComposioToolSet  # type: ignore
except ImportError:  # composio not installed in this environment / package name may differ by version
    ComposioToolSet = None


class ComposioService:
    def __init__(self) -> None:
        self._toolset = None
        if ComposioToolSet and settings.COMPOSIO_API_KEY:
            self._toolset = ComposioToolSet(api_key=settings.COMPOSIO_API_KEY)

    def get_tools(self, actions: list[str]) -> list:
        """Return LangChain-compatible tool objects for the given Composio action slugs."""
        if not self._toolset:
            return []
        return self._toolset.get_tools(actions=actions)

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

    def execute_action(self, action: str, params: dict, tenant_id: str) -> dict:
        """Execute a single Composio action for a tenant's connected entity.

        Falls back to a deterministic stub result when Composio isn't configured (no API
        key / package not installed), so the executor pipeline still runs end to end in
        local dev or before a tenant has connected any tools.
        """
        if not self._toolset:
            return {
                "executed": False,
                "stub": True,
                "action": action,
                "message": f"Composio not configured - stubbed execution of {action}",
                "input": params,
            }
        try:
            entity = self._toolset.get_entity(id=tenant_id)
            result = entity.execute_action(action=action, params=params)
            return {"executed": True, "stub": False, "action": action, "output": result}
        except Exception as exc:  # keep the executor pipeline resilient to provider errors
            return {"executed": False, "stub": False, "action": action, "error": str(exc), "input": params}


composio_service = ComposioService()
