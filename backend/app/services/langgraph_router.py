"""Layer 1: Router.

Classifies an incoming request (chat message, scheduled trigger, webhook) and decides
which agent should own it. Uses fast keyword matching first (target sub-150ms) and only
falls back to an LLM classification call when keywords are ambiguous. Always falls back
to the CEO agent if no confident match is found, since the CEO can re-route down the org
chart.
"""
from dataclasses import dataclass

KEYWORD_ROUTES = {
    "budget": "CFO", "spend": "CFO", "invoice": "CFO", "fiscal": "CFO",
    "roadmap": "CTO", "deploy": "CTO", "infra": "CTO", "architecture": "CTO",
    "bug": "Software Engineer", "issue": "Software Engineer", "pr": "Software Engineer",
    "code review": "Software Engineer",
    "prd": "Product Manager", "feature spec": "Product Manager", "backlog": "Product Manager",
    "calendar": "CEO Office", "schedule a meeting": "CEO Office", "email": "CEO Office",
}


@dataclass
class RouteResult:
    agent_position: str
    confidence: float
    method: str  # "keyword" | "llm" | "fallback"


def route_keyword(message: str) -> RouteResult | None:
    lowered = message.lower()
    for keyword, position in KEYWORD_ROUTES.items():
        if keyword in lowered:
            return RouteResult(agent_position=position, confidence=0.9, method="keyword")
    return None


async def route_llm(message: str) -> RouteResult:
    """Falls back to an LLM call (Groq) when keyword routing is ambiguous.

    TODO: wire to a real Groq classification call using GROQ_API_KEY. Kept synchronous-safe
    stub here so the router still returns sub-150ms in the common (keyword) case.
    """
    return RouteResult(agent_position="CEO", confidence=0.4, method="llm")


async def route(message: str) -> RouteResult:
    result = route_keyword(message)
    if result:
        return result
    try:
        return await route_llm(message)
    except Exception:
        return RouteResult(agent_position="CEO", confidence=0.0, method="fallback")
