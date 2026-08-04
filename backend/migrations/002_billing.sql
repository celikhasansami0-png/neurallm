-- Stripe billing columns on tenants.
-- `plan` already exists (default 'team') from 001_init.sql; we widen its default to 'trial'
-- so brand-new tenants start in a trial state until they complete Stripe checkout.

alter table tenants add column if not exists stripe_customer_id text;
alter table tenants add column if not exists stripe_subscription_id text;
alter table tenants add column if not exists trial_ends_at timestamptz;
alter table tenants add column if not exists subscription_status text default 'trialing';

alter table tenants alter column plan set default 'trial';

-- Backfill: existing tenants keep their current plan value; only the column default changes
-- for future inserts. Give any tenant without a subscription_status a sane starting value.
update tenants set subscription_status = 'trialing' where subscription_status is null;
