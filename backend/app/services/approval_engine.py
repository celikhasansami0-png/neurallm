"""Risk-scores actions and decides whether a task must pause for human approval before executing."""

HIGH_RISK_KEYWORDS = {
    "email", "send_email", "gmail", "external_api", "payment", "invoice",
    "wire", "refund", "charge", "financial", "budget_spend", "delete_repo",
    "post_public", "publish",
}
MEDIUM_RISK_KEYWORDS = {"calendar", "github_issue", "slack_post", "crm_update"}


def score_risk(tool_name: str, integration: str = "") -> str:
    haystack = f"{tool_name} {integration}".lower()
    if any(k in haystack for k in HIGH_RISK_KEYWORDS):
        return "high"
    if any(k in haystack for k in MEDIUM_RISK_KEYWORDS):
        return "medium"
    return "low"


def requires_approval(tool_name: str, integration: str = "") -> bool:
    """Outbound actions (email/external API/financial) always require human approval."""
    return score_risk(tool_name, integration) == "high"


def next_status(tool_name: str, integration: str = "") -> str:
    return "awaiting_approval" if requires_approval(tool_name, integration) else "running"
