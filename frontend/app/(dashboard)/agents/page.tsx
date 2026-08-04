"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";

type Agent = {
  id: string;
  name: string;
  org_position: string;
  level: number;
  system_prompt: string;
  allowed_tools: string[];
  reports_to: string | null;
  color: string;
  is_active: boolean;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "org">("grid");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", org_position: "", level: 3, system_prompt: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [agentsRes, tasksRes] = await Promise.all([api.agents(), api.tasks().catch(() => [])]);
      setAgents(agentsRes || []);
      setTasks(tasksRes || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load agents.");
    } finally {
      setLoading(false);
    }
  }

  const tasksByAgent = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) counts[t.agent_id] = (counts[t.agent_id] || 0) + 1;
    return counts;
  }, [tasks]);

  const byLevel = agents.reduce<Record<number, Agent[]>>((acc, a) => {
    (acc[a.level] = acc[a.level] || []).push(a);
    return acc;
  }, {});

  async function toggleActive(agent: Agent) {
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, is_active: !a.is_active } : a)));
    try {
      await api.updateAgent(agent.id, {
        name: agent.name, org_position: agent.org_position, level: agent.level,
        system_prompt: agent.system_prompt, allowed_tools: agent.allowed_tools,
        reports_to: agent.reports_to, color: agent.color, is_active: !agent.is_active,
      });
    } catch {
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, is_active: agent.is_active } : a)));
    }
  }

  async function createAgent() {
    if (!form.name.trim() || !form.org_position.trim()) return;
    setSaving(true);
    try {
      await api.createAgent({
        name: form.name, org_position: form.org_position, level: form.level,
        system_prompt: form.system_prompt, allowed_tools: [],
      });
      setShowModal(false);
      setForm({ name: "", org_position: "", level: 3, system_prompt: "" });
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create agent.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Your company's org chart of AI executors."
        action={
          <div className="flex items-center gap-2">
            <div className="control flex border border-border p-0.5 text-sm">
              <button onClick={() => setView("grid")} className={`control px-3 py-1.5 ${view === "grid" ? "bg-white text-black" : "text-[#CCCCCC]"}`}>Grid</button>
              <button onClick={() => setView("org")} className={`control px-3 py-1.5 ${view === "org" ? "bg-white text-black" : "text-[#CCCCCC]"}`}>Org chart</button>
            </div>
            <button onClick={() => setShowModal(true)} className="control bg-white px-4 py-2 text-sm font-medium text-black">Add Agent</button>
          </div>
        }
      />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      {loading ? (
        <div className="py-20 text-center text-sm text-muted">Loading agents…</div>
      ) : agents.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">
          No agents yet. Click "Add Agent" to create your first one.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div key={a.id} className="card group p-5 transition-colors hover:border-[#333333]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${a.is_active ? "border-[#22C55E]/30 bg-[#1A2E1F] text-[#22C55E]" : "border-border bg-[#1A1A1A] text-muted"}`}>
                    {a.is_active ? "Active" : "Paused"}
                  </span>
                  <span className="rounded-full border border-border bg-[#1A1A1A] px-2 py-0.5 text-[11px] text-muted">Level {a.level}</span>
                </div>
                <ToggleSwitch checked={a.is_active} onChange={() => toggleActive(a)} />
              </div>
              <div className="agent-name mt-4 text-lg font-semibold text-white">{a.name}</div>
              <p className="mt-1 text-sm text-muted">{a.org_position}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(a.allowed_tools || []).map((t) => (
                  <span key={t} className="agent-name rounded-control bg-[#1A1A1A] px-2 py-0.5 text-[11px] text-[#CCCCCC]">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">{tasksByAgent[a.id] || 0} tasks total</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, levelAgents]) => (
            <div key={level}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Level {level}</div>
              <div className="flex flex-wrap gap-3">
                {levelAgents.map((a) => (
                  <div key={a.id} className="card px-4 py-3 transition-colors hover:border-[#333333]">
                    <div className="agent-name text-sm font-semibold text-white">{a.name}</div>
                    <div className="text-xs text-muted">{a.org_position}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="page-title text-xl text-white">Add Agent</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Agent name" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
              <input
                value={form.org_position} onChange={(e) => setForm((f) => ({ ...f, org_position: e.target.value }))}
                placeholder="Org position" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
              <input
                value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) || 1 }))}
                placeholder="Level (1-4)" type="number" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
              <textarea
                value={form.system_prompt} onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
                placeholder="System prompt" rows={3} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="control border border-border px-4 py-2 text-sm text-[#CCCCCC]">Cancel</button>
              <button disabled={saving} onClick={createAgent} className="control bg-white px-4 py-2 text-sm text-black disabled:opacity-50">
                {saving ? "Creating…" : "Create agent"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#22C55E]" : "bg-[#1A1A1A]"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}
