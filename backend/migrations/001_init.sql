-- NeuraLLM initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) after creating the project.

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ========== TENANTS ==========
create table if not exists tenants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    data_region text not null default 'us',
    plan text not null default 'team',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ========== USERS ==========
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    email text unique not null,
    hashed_password text not null,
    full_name text default '',
    role text not null default 'admin',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_users_tenant on users(tenant_id);

-- ========== AGENTS ==========
create table if not exists agents (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    org_position text not null,
    level int not null,
    reports_to uuid,
    system_prompt text default '',
    allowed_tools jsonb not null default '[]',
    memory jsonb not null default '{}',
    is_active boolean not null default true,
    color text not null default '#000000',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_agents_tenant on agents(tenant_id);

-- ========== TASKS ==========
create table if not exists tasks (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    agent_id uuid not null references agents(id) on delete cascade,
    created_by uuid not null references users(id),
    title text not null,
    description text default '',
    status text not null default 'pending',
    risk_level text not null default 'low',
    approved_by uuid,
    result jsonb not null default '{}',
    plan jsonb not null default '[]',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_tasks_tenant on tasks(tenant_id);
create index if not exists idx_tasks_status on tasks(tenant_id, status);

-- ========== TOOL CALLS ==========
create table if not exists tool_calls (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    task_id uuid not null references tasks(id) on delete cascade,
    agent_id uuid not null references agents(id) on delete cascade,
    tool_name text not null,
    integration text default '',
    input_payload jsonb not null default '{}',
    output_payload jsonb not null default '{}',
    status text not null default 'completed',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_tool_calls_tenant on tool_calls(tenant_id);
create index if not exists idx_tool_calls_task on tool_calls(task_id);

-- ========== RECURRING TASKS ==========
create table if not exists recurring_tasks (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    agent_id uuid not null references agents(id) on delete cascade,
    title text not null,
    prompt text default '',
    cron_expression text not null default '0 9 * * 1',
    is_active boolean not null default true,
    last_run_at text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_recurring_tenant on recurring_tasks(tenant_id);

-- ========== WORKFLOWS ==========
create table if not exists workflows (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    chain jsonb not null default '[]',
    status text not null default 'idle',
    last_run_result jsonb not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_workflows_tenant on workflows(tenant_id);

-- ========== INTEGRATION CONNECTIONS ==========
create table if not exists integration_connections (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    tool_slug text not null,
    display_name text not null,
    category text not null default 'productivity',
    status text not null default 'connected',
    composio_connection_id text default '',
    metadata_json jsonb not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_integrations_tenant on integration_connections(tenant_id);

-- ========== KNOWLEDGE DOCUMENTS ==========
create table if not exists knowledge_documents (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    filename text not null,
    file_type text not null default 'pdf',
    size_bytes int not null default 0,
    status text not null default 'processing',
    chunk_count int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_knowledge_docs_tenant on knowledge_documents(tenant_id);

-- ========== KNOWLEDGE CHUNKS (pgvector) ==========
create table if not exists knowledge_chunks (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    document_id uuid not null references knowledge_documents(id) on delete cascade,
    content text default '',
    embedding vector(1536),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_knowledge_chunks_tenant on knowledge_chunks(tenant_id);
create index if not exists idx_knowledge_chunks_embedding on knowledge_chunks
    using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ========== AUDIT LOGS (SOC2-style) ==========
create table if not exists audit_logs (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    task_id uuid,
    actor text not null,
    action text not null,
    payload jsonb not null default '{}',
    result jsonb not null default '{}',
    risk_level text not null default 'low',
    approved_by text,
    replay_step int not null default 1,
    replay_total_steps int not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_audit_tenant on audit_logs(tenant_id);
create index if not exists idx_audit_task on audit_logs(task_id);

-- ========== ROW LEVEL SECURITY ==========
-- Every tenant-scoped table gets RLS enabled. Policies assume the app sets
-- `set_config('app.current_tenant_id', <tenant_id>, true)` per request/session
-- (see backend/app/core/deps.py for the application-layer enforcement used by the API).

alter table users enable row level security;
alter table agents enable row level security;
alter table tasks enable row level security;
alter table tool_calls enable row level security;
alter table recurring_tasks enable row level security;
alter table workflows enable row level security;
alter table integration_connections enable row level security;
alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table audit_logs enable row level security;

create policy tenant_isolation_users on users
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_agents on agents
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_tasks on tasks
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_tool_calls on tool_calls
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_recurring on recurring_tasks
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_workflows on workflows
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_integrations on integration_connections
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_knowledge_docs on knowledge_documents
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_knowledge_chunks on knowledge_chunks
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
create policy tenant_isolation_audit on audit_logs
    using (tenant_id::text = current_setting('app.current_tenant_id', true));
