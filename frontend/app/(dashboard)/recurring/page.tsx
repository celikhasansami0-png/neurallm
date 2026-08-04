"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";

export default function RecurringPage() {
  const [items, setItems] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ agent_id: "", title: "", prompt: "", cron_expression: "0 9 * * 1" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [itemsRes, agentsRes] = await Promise.all([api.recurring(), api.agents()]);
      setItems(itemsRes || []);
      setAgents(agentsRes || []);
      if ((agentsRes || []).length > 0) setForm((f) => ({ ...f, agent_id: f.agent_id || agentsRes[0].id }));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load recurring tasks.");
    } finally {
      setLoading(false);
    }
  }

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  async function create() {
    if (!form.title.trim() || !form.agent_id) return;
    setSaving(true);
    try {
      await api.createRecurring(form);
      setShowModal(false);
      setForm((f) => ({ ...f, title: "", prompt: "" }));
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create recurring task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: any) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)));
    try {
      await api.updateRecurring(item.id, {
        agent_id: item.agent_id, title: item.title, prompt: item.prompt,
        cron_expression: item.cron_expression, is_active: !item.is_active,
      });
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: item.is_active } : i)));
    }
  }

  return (
    <div>
      <PageHeader
        title="Recurring"
        subtitle="Standing jobs your agents run on a schedule."
        action={
          <button onClick={() => setShowModal(true)} className="control bg-white px-4 py-2 text-sm font-medium text-black">
            New recurring task
          </button>
        }
      />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      {loading ? (
        <div className="py-20 text-center text-sm text-muted">Loading recurring tasks…</div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No recurring tasks yet. Click "New recurring task" to schedule one.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold">{r.title}</div>
                <button onClick={() => toggleActive(r)}>
                  <Badge value={r.is_active ? "completed" : "pending"}>{r.is_active ? "Active" : "Paused"}</Badge>
                </button>
              </div>
              <div className="agent-name mt-1 text-xs text-muted">{agentNameById[r.agent_id] || "—"}</div>
              <div className="mt-4 text-xs text-muted">Schedule</div>
              <div className="agent-name text-sm">{r.cron_expression}</div>
              <div className="mt-2 text-xs text-muted">
                {r.last_run_at ? `Last run ${new Date(r.last_run_at).toLocaleString()}` : "Never run yet"}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="page-title text-xl text-white">New recurring task</h2>
            <div className="mt-4 space-y-3">
              <select
                value={form.agent_id} onChange={(e) => setForm((f) => ({ ...f, agent_id: e.target.value }))}
                className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none"
              >
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input
                value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
              <textarea
                value={form.prompt} onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
                placeholder="Prompt" rows={3} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
              <input
                value={form.cron_expression} onChange={(e) => setForm((f) => ({ ...f, cron_expression: e.target.value }))}
                placeholder="Cron expression, e.g. 0 9 * * 1"
                className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="control border border-border px-4 py-2 text-sm text-[#CCCCCC]">Cancel</button>
              <button disabled={saving} onClick={create} className="control bg-white px-4 py-2 text-sm text-black disabled:opacity-50">
                {saving ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
