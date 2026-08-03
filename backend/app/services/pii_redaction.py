"""Scans tool outputs for PII (email, phone, credit card) and redacts before persisting/logging."""
import re

EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
CREDIT_CARD_RE = re.compile(r"\b(?:\d[ -]*?){13,16}\b")

REDACTION_TOKEN = "[REDACTED]"


def redact_pii(text: str) -> str:
    if not text:
        return text
    text = EMAIL_RE.sub(REDACTION_TOKEN, text)
    text = PHONE_RE.sub(REDACTION_TOKEN, text)
    text = CREDIT_CARD_RE.sub(REDACTION_TOKEN, text)
    return text


def redact_payload(payload: dict) -> dict:
    """Recursively walk a JSON-like dict/list and redact PII in every string value."""
    if isinstance(payload, dict):
        return {k: redact_payload(v) for k, v in payload.items()}
    if isinstance(payload, list):
        return [redact_payload(v) for v in payload]
    if isinstance(payload, str):
        return redact_pii(payload)
    return payload
