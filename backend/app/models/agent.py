from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, gen_uuid


class Agent(Base, TimestampMixin):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    org_position: Mapped[str] = mapped_column(String(255), nullable=False)  # e.g. CEO, CTO
    level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 = top of org chart
    reports_to: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    system_prompt: Mapped[str] = mapped_column(Text, default="")
    allowed_tools: Mapped[list] = mapped_column(JSON, default=list)
    memory: Mapped[dict] = mapped_column(JSON, default=dict)  # persistent per-agent memory
    is_active: Mapped[bool] = mapped_column(default=True)
    color: Mapped[str] = mapped_column(String(16), default="#000000")
