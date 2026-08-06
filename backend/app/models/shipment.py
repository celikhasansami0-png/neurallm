from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, gen_uuid

# address_type: santiye | depo | acik_adres
# delivery_time: acil | fabrikaya_bagli | tarihli
# status: pending | preparing | shipped | delivered


class Shipment(Base, TimestampMixin):
    __tablename__ = "shipments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    tenant_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    order_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("orders.id"), nullable=False)
    address_type: Mapped[str] = mapped_column(String(32), default="acik_adres")
    address_text: Mapped[str] = mapped_column(Text, default="")
    city: Mapped[str] = mapped_column(String(128), default="")
    district: Mapped[str] = mapped_column(String(128), default="")
    delivery_time: Mapped[str] = mapped_column(String(32), default="tarihli")
    delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    recipient_name: Mapped[str] = mapped_column(String(255), default="")
    recipient_phone: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(32), default="pending")
