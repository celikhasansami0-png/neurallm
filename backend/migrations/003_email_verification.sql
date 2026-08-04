-- Email verification + password reset support on users.

alter table users add column if not exists email_verified boolean not null default false;
alter table users add column if not exists verification_token text;
alter table users add column if not exists verification_token_expires timestamptz;
alter table users add column if not exists reset_token text;
alter table users add column if not exists reset_token_expires timestamptz;

create index if not exists idx_users_verification_token on users(verification_token);
create index if not exists idx_users_reset_token on users(reset_token);
