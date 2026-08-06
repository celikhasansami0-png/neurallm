from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, gen_uuid

# doc_type: irsaliye | fatura


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("orders.id"), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(16), default="irsaliye")
    doc_number: Mapped[str] = mapped_column(String(64), nullable=False)
    pdf_path: Mapped[str] = mapped_column(String(1000), default="")
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
