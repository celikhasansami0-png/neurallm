from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin, gen_uuid


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    data_region: Mapped[str] = mapped_column(String(32), default="us")
    plan: Mapped[str] = mapped_column(String(32), default="trial")

    # Legacy Stripe billing columns (see migrations/002_billing.sql) - unused, kept for
    # backwards compatibility with existing rows; the app no longer reads/writes these.
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Lemon Squeezy billing (see migrations/005_lemonsqueezy.sql)
    lemonsqueezy_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lemonsqueezy_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    trial_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    subscription_status: Mapped[str] = mapped_column(String(32), default="trialing")

    # Outbound webhooks (see migrations/004_webhooks.sql)
    webhook_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
