-- Outbound webhook delivery target for a tenant, configured from Settings.

alter table tenants add column if not exists webhook_url text;
