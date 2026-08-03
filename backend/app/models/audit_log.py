from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, gen_uuid


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    task_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)  # agent name or user email
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    result: Mapped[dict] = mapped_column(JSON, default=dict)
    risk_level: Mapped[str] = mapped_column(String(16), default="low")
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    replay_step: Mapped[int] = mapped_column(default=1)
    replay_total_steps: Mapped[int] = mapped_column(default=1)
