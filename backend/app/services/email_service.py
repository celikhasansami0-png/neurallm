"""Outbound transactional email (verification links, password resets).

Sends via the Resend API when RESEND_API_KEY is set. If it's missing, this never raises -
it just logs the email at INFO level so local dev and any deployment without Resend
configured still works end to end (the link is visible in the server logs instead of an
inbox).
"""
from __future__ import annotations

import logging

import resend

from app.core.config import settings

logger = logging.getLogger("quantum2.email")


class EmailService:
    def _is_configured(self) -> bool:
        return bool(settings.RESEND_API_KEY)

    def send(self, to: str, subject: str, body: str) -> bool:
        """Returns True if actually sent via Resend, False if it fell back to logging."""
        if not self._is_configured():
            logger.info("EMAIL (Resend not configured, logging only) to=%s subject=%s body=%s", to, subject, body)
            return False

        try:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to],
                "subject": subject,
                "text": body,
            })
            return True
        except Exception:
            logger.exception("Failed to send email to=%s subject=%s via Resend; content logged below", to, subject)
            logger.info("EMAIL (send failed, logging only) to=%s subject=%s body=%s", to, subject, body)
            return False

    def send_verification_email(self, to: str, token: str) -> bool:
        link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        return self.send(
            to=to,
            subject="Verify your Managent email",
            body=(
                "Welcome to Managent.\n\n"
                f"Verify your email address by visiting:\n{link}\n\n"
                "This link expires in 24 hours."
            ),
        )

    def send_password_reset_email(self, to: str, token: str) -> bool:
        link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        return self.send(
            to=to,
            subject="Reset your Managent password",
            body=(
                "We received a request to reset your Managent password.\n\n"
                f"Reset it by visiting:\n{link}\n\n"
                "If you didn't request this, you can safely ignore this email. "
                "This link expires in 1 hour."
            ),
        )


email_service = EmailService()
