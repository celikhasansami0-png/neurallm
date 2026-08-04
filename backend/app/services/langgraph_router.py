"""Layer 1: Router.

Classifies an incoming request (chat message, scheduled trigger, webhook) and decides
which agent should own it. Uses fast keyword matching first (target sub-150ms) and only
falls back to an LLM classification call when keywords are ambiguous. Always falls back
to the CEO agent if no confident match is found, since the CEO can re-route down the org
chart.
"""
from dataclasses import dataclass

from groq import Groq

from app.core.config import settings

VALID_POSITIONS = ["CEO", "CEO Office", "CTO", "CFO", "Product Manager", "Software Engineer"]

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

    Only used when route_keyword() finds no confident match, so this cold path being a bit
    slower than the keyword path is fine. Falls back to a deterministic CEO-office route if
    GROQ_API_KEY isn't configured, or if the Groq call itself fails for any reason.
    """
    if not settings.GROQ_API_KEY:
        return RouteResult(agent_position="CEO", confidence=0.4, method="llm")

    client = Groq(api_key=settings.GROQ_API_KEY)
    system_prompt = (
        "You classify an incoming request to exactly one company role. Reply with only the "
        f"role name, nothing else. Valid roles: {', '.join(VALID_POSITIONS)}. If unsure, reply 'CEO'."
    )
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        temperature=0,
        max_tokens=16,
    )
    raw = (completion.choices[0].message.content or "").strip()
    position = next((p for p in VALID_POSITIONS if p.lower() in raw.lower()), "CEO")
    return RouteResult(agent_position=position, confidence=0.75, method="llm")


async def route(message: str) -> RouteResult:
    result = route_keyword(message)
    if result:
        return result
    try:
        return await route_llm(message)
    except Exception:
        return RouteResult(agent_position="CEO", confidence=0.0, method="fallback")
