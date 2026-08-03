"""Layer 2: Orchestrator.

Given a routed request and the target agent, plans a multi-step execution using Groq
llama-3.3-70b-versatile, then hands each step to an Executor. This module owns the
plan -> execute -> log loop; individual tool calls are performed by executors using the
tools attached to their agent (see composio_service.py).
"""
from dataclasses import dataclass, field

from groq import Groq

from app.core.config import settings

SYSTEM_PROMPT_TEMPLATE = """You are the orchestrator for {agent_name}, who holds the position
of {org_position} inside a company's AI operating system called NeuraLLM. Break the user's
request into a short, concrete step-by-step plan using only these allowed tools: {tools}.
Never propose an action outside this agent's IAM scope. Return the plan as a numbered list."""


@dataclass
class PlanStep:
    step: int
    description: str
    tool: str | None = None


@dataclass
class Plan:
    steps: list[PlanStep] = field(default_factory=list)


def _client() -> Groq | None:
    if not settings.GROQ_API_KEY:
        return None
    return Groq(api_key=settings.GROQ_API_KEY)


async def plan_task(agent_name: str, org_position: str, allowed_tools: list[str], request: str) -> Plan:
    client = _client()
    if client is None:
        # No live Groq key configured - deterministic single-step plan so the pipeline still runs.
        return Plan(steps=[PlanStep(step=1, description=request, tool=allowed_tools[0] if allowed_tools else None)])

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        agent_name=agent_name, org_position=org_position, tools=", ".join(allowed_tools)
    )
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request},
        ],
        temperature=0.2,
    )
    text = completion.choices[0].message.content or ""
    steps = [
        PlanStep(step=i + 1, description=line.strip())
        for i, line in enumerate(text.splitlines())
        if line.strip()
    ]
    return Plan(steps=steps or [PlanStep(step=1, description=request)])
