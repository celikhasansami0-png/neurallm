-- Lemon Squeezy billing columns, replacing Stripe as the payment provider.
-- Old stripe_customer_id / stripe_subscription_id columns are left in place (unused) for
-- backwards compatibility with any existing rows.

alter table tenants add column if not exists lemonsqueezy_customer_id text;
alter table tenants add column if not exists lemonsqueezy_subscription_id text;
