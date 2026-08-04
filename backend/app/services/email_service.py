"""Outbound transactional email (verification links, password resets).

Sends via SMTP using stdlib smtplib when SMTP_HOST/PORT/USER/PASSWORD are all set. If any of
those env vars is missing, this never raises - it just logs the email at INFO level so local
dev and any deployment without SMTP configured still works end to end (the link is visible
in the server logs instead of an inbox).
"""
from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("quantum2.email")


class EmailService:
    def _is_configured(self) -> bool:
        return bool(settings.SMTP_HOST and settings.SMTP_PORT and settings.SMTP_USER and settings.SMTP_PASSWORD)

    def send(self, to: str, subject: str, body: str) -> bool:
        """Returns True if actually sent over SMTP, False if it fell back to logging."""
        if not self._is_configured():
            logger.info("EMAIL (SMTP not configured, logging only) to=%s subject=%s body=%s", to, subject, body)
            return False

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, [to], msg.as_string())
            return True
        except Exception:
            logger.exception("Failed to send email to=%s subject=%s via SMTP; content logged below", to, subject)
            logger.info("EMAIL (send failed, logging only) to=%s subject=%s body=%s", to, subject, body)
            return False

    def send_verification_email(self, to: str, token: str) -> bool:
        link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        return self.send(
            to=to,
            subject="Verify your Quantum² email",
            body=(
                "Welcome to Quantum².\n\n"
                f"Verify your email address by visiting:\n{link}\n\n"
                "This link expires in 24 hours."
            ),
        )

    def send_password_reset_email(self, to: str, token: str) -> bool:
        link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        return self.send(
            to=to,
            subject="Reset your Quantum² password",
            body=(
                "We received a request to reset your Quantum² password.\n\n"
                f"Reset it by visiting:\n{link}\n\n"
                "If you didn't request this, you can safely ignore this email. "
                "This link expires in 1 hour."
            ),
        )


email_service = EmailService()
