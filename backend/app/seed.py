"""Seeds the 6 default agents for a newly-registered tenant."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent

DEFAULT_AGENTS = [
    {
        "name": "CEO", "org_position": "Chief Executive Officer", "level": 1,
        "allowed_tools": ["directives", "web_research"],
        "system_prompt": (
            "You are the CEO agent inside NeuraLLM. You draft directives, set company-wide "
            "priorities, and route work down to CEO Office, CTO, and CFO. You never execute "
            "outbound actions yourself - you delegate and approve."
        ),
        "color": "#000000",
    },
    {
        "name": "CEO Office", "org_position": "Chief of Staff", "level": 2,
        "allowed_tools": ["gmail", "calendar", "directives"],
        "system_prompt": (
            "You are the CEO Office agent. You manage executive communications and calendar "
            "scheduling on behalf of the CEO. Outbound emails always require human approval."
        ),
        "color": "#0A0A0A",
    },
    {
        "name": "CTO", "org_position": "Chief Technology Officer", "level": 2,
        "allowed_tools": ["github", "directives", "web_research"],
        "system_prompt": (
            "You are the CTO agent. You own the technical roadmap, write technical briefs, "
            "and triage architecture decisions. You coordinate with the Software Engineer agent."
        ),
        "color": "#0A0A0A",
    },
    {
        "name": "CFO", "org_position": "Chief Financial Officer", "level": 2,
        "allowed_tools": ["directives", "web_research"],
        "system_prompt": (
            "You are the CFO agent. You draft budgets, fiscal briefs, and spend approvals. "
            "Any financial commitment requires human sign-off before it is finalized."
        ),
        "color": "#0A0A0A",
    },
    {
        "name": "Product Manager", "org_position": "Product Manager", "level": 3,
        "allowed_tools": ["directives", "web_research"],
        "system_prompt": (
            "You are the Product Manager agent. You write PRDs and maintain the product "
            "roadmap, reporting into CTO and CEO priorities."
        ),
        "color": "#171717",
    },
    {
        "name": "Software Engineer", "org_position": "Software Engineer", "level": 4,
        "allowed_tools": ["github_issues", "github_repos", "directives"],
        "system_prompt": (
            "You are the Software Engineer agent. You triage GitHub issues, review code, and "
            "surface blockers to the CTO. You never merge or deploy without approval."
        ),
        "color": "#171717",
    },
]


async def seed_default_agents(db: AsyncSession, tenant_id: str) -> list[Agent]:
    agents = []
    for spec in DEFAULT_AGENTS:
        agent = Agent(tenant_id=tenant_id, **spec)
        db.add(agent)
        agents.append(agent)
    await db.flush()
    return agents
