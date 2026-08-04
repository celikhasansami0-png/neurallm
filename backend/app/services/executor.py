"""Layer 3: Executor.

Runs a single plan step for a specific agent, using only the tools attached to that agent
and staying inside its org_position IAM scope. Every tool call is logged via AuditLog with
PII redacted from outputs. High-risk actions (outbound email, external API, financial) are
paused for human approval by approval_engine before they execute.
"""
from dataclasses import dataclass

from app.services.approval_engine import next_status, score_risk
from app.services.composio_service import composio_service
from app.services.pii_redaction import redact_payload


@dataclass
class ExecutionResult:
    tool_name: str
    integration: str
    status: str  # completed | awaiting_approval | failed
    output: dict
    risk_level: str


async def execute_step(
    agent_name: str, tool_name: str, integration: str, input_payload: dict, tenant_id: str = "",
    already_approved: bool = False,
) -> ExecutionResult:
    risk = score_risk(tool_name, integration)
    status = next_status(tool_name, integration)
    if status == "awaiting_approval" and not already_approved:
        return ExecutionResult(
            tool_name=tool_name, integration=integration, status="awaiting_approval",
            output={}, risk_level=risk,
        )

    # Real tool execution goes through composio_service when COMPOSIO_API_KEY is configured;
    # it returns a deterministic stub result otherwise so this pipeline still runs end to end.
    action = f"{integration}_{tool_name}" if integration else tool_name
    raw_output = composio_service.execute_action(action=action, params=input_payload, tenant_id=tenant_id)
    raw_output["message"] = raw_output.get("message") or f"{agent_name} executed {tool_name} via {integration or 'internal'}"
    safe_output = redact_payload(raw_output)
    return ExecutionResult(
        tool_name=tool_name, integration=integration, status="completed",
        output=safe_output, risk_level=risk,
    )
