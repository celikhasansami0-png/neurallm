-- Phratic B2B operations schema
-- Adds cari (customers/suppliers), products, orders, shipments, invoices, payments.
-- Run in the Supabase SQL editor after 001-005 have already been applied.

-- ========== CARILER (customers & suppliers) ==========
create table if not exists cariler (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    type text not null default 'customer', -- customer | supplier
    name text not null,
    contact_name text default '',
    phone text default '',
    email text default '',
    address text default '',
    tax_number text default '',
    payment_terms text default '',
    credit_limit numeric(14,2) not null default 0,
    currency text not null default 'TRY',
    balance numeric(14,2) not null default 0, -- outstanding balance, positive = they owe us
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_cariler_tenant on cariler(tenant_id);
create index if not exists idx_cariler_type on cariler(tenant_id, type);

-- ========== PRODUCTS ==========
create table if not exists products (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    sku text default '',
    name text not null,
    unit text not null default 'adet',
    price numeric(14,2) not null default 0,
    currency text not null default 'TRY',
    tax_rate numeric(5,2) not null default 20,
    stock_quantity numeric(14,2) not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_products_tenant on products(tenant_id);

-- ========== ORDERS (Sipariş / Proforma) ==========
create table if not exists orders (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    order_number text not null,
    cari_id uuid not null references cariler(id),
    created_by uuid not null references users(id),
    status text not null default 'draft', -- draft | confirmed | shipped | invoiced
    payment_method text not null default 'cash', -- cash | credit_card | deferred
    installment text default '', -- tek_cekim | 3 | 5 | 7 (when credit_card)
    deferred_days int, -- 60 | 90 | 120 | 150 (when deferred)
    currency text not null default 'TRY',
    subtotal numeric(14,2) not null default 0,
    tax_total numeric(14,2) not null default 0,
    total numeric(14,2) not null default 0,
    notes text default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_orders_tenant on orders(tenant_id);
create index if not exists idx_orders_cari on orders(cari_id);
create index if not exists idx_orders_status on orders(tenant_id, status);
create unique index if not exists idx_orders_number on orders(tenant_id, order_number);

-- ========== ORDER ITEMS ==========
create table if not exists order_items (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid not null references products(id),
    quantity numeric(14,2) not null default 1,
    unit_price numeric(14,2) not null default 0,
    tax_rate numeric(5,2) not null default 20,
    line_total numeric(14,2) not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_tenant on order_items(tenant_id);

-- ========== SHIPMENTS (Sevkiyat) ==========
create table if not exists shipments (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    order_id uuid not null references orders(id) on delete cascade,
    address_type text not null default 'acik_adres', -- santiye | depo | acik_adres
    address_text text default '',
    city text default '',
    district text default '',
    delivery_time text not null default 'tarihli', -- acil | fabrikaya_bagli | tarihli
    delivery_date date,
    recipient_name text default '',
    recipient_phone text default '',
    status text not null default 'pending', -- pending | preparing | shipped | delivered
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_shipments_tenant on shipments(tenant_id);
create index if not exists idx_shipments_order on shipments(order_id);

-- ========== DOCUMENTS (İrsaliye / Fatura) ==========
create table if not exists documents (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    order_id uuid not null references orders(id) on delete cascade,
    doc_type text not null default 'irsaliye', -- irsaliye | fatura
    doc_number text not null,
    pdf_path text default '',
    issued_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_documents_tenant on documents(tenant_id);
create index if not exists idx_documents_order on documents(order_id);
create unique index if not exists idx_documents_number on documents(tenant_id, doc_number);

-- ========== PAYMENTS ==========
create table if not exists payments (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    order_id uuid not null references orders(id) on delete cascade,
    amount numeric(14,2) not null default 0,
    currency text not null default 'TRY',
    method text not null default 'cash',
    due_date date,
    paid_at timestamptz,
    status text not null default 'pending', -- pending | paid | overdue
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_payments_tenant on payments(tenant_id);
create index if not exists idx_payments_order on payments(order_id);
create index if not exists idx_payments_status on payments(tenant_id, status);

-- ========== ROW LEVEL SECURITY ==========
alter table cariler enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table shipments enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;

create policy tenant_isolation_cariler on cariler
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_products on products
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_orders on orders
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_order_items on order_items
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_shipments on shipments
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_documents on documents
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_payments on payments
    using (tenant_id::text = current_setting('app.current_tenant_id', true));

-- ========== DROP OLD AI-ONLY TABLES (Phratic has no AI agents) ==========
-- Commented out by default so existing data isn't destroyed automatically;
-- uncomment and run manually once you've confirmed you no longer need this data.
-- drop table if exists knowledge_chunks cascade;
-- drop table if exists knowledge_documents cascade;
-- drop table if exists tool_calls cascade;
-- drop table if exists tasks cascade;
-- drop table if exists workflows cascade;
-- drop table if exists recurring_tasks cascade;
-- drop table if exists agents cascade;
