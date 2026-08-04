"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "awaiting_approval", label: "Needs approval" },
  { key: "failed", label: "Failed" },
] as const;

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [tasksRes, agentsRes] = await Promise.all([api.tasks(), api.agents().catch(() => [])]);
      setTasks(tasksRes || []);
      setAgents(agentsRes || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    for (const f of FILTERS) {
      if (f.key === "all") continue;
      c[f.key] = tasks.filter((t) => t.status === f.key).length;
    }
    return c;
  }, [tasks]);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  async function handleAction(t: any) {
    setBusyId(t.id);
    try {
      if (t.status === "awaiting_approval") {
        await api.approveTask(t.id);
      }
      await load();
    } catch (err: any) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Every task an agent has run or is running, across the company."
        action={
          <button className="control flex items-center gap-2 border border-border px-3 py-2 text-sm text-[#CCCCCC]">
            All time <ChevronDown size={14} />
          </button>
        }
      />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`control flex items-center gap-1.5 border px-3 py-1.5 text-sm ${
              filter === f.key ? "border-white bg-[#1A1A1A] text-white" : "border-border text-[#CCCCCC]"
            }`}
          >
            {f.label}
            <span className="rounded-full bg-[#1A1A1A] px-1.5 py-0.5 text-[10px] text-muted">{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted">Loading tasks…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No tasks in this view.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer border-b border-border last:border-0 hover:bg-[#141414]">
                  <td className="px-4 py-3"><Badge value={t.status} /></td>
                  <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                  <td className="agent-name px-4 py-3 text-xs text-muted">{agentNameById[t.agent_id] || "—"}</td>
                  <td className="px-4 py-3 text-muted">{timeAgo(t.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(t);
                      }}
                      disabled={busyId === t.id || t.status !== "awaiting_approval"}
                      className={`control px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                        t.status === "awaiting_approval" ? "bg-[#22C55E] text-black" : "border border-border text-[#CCCCCC]"
                      }`}
                    >
                      {busyId === t.id ? "…" : t.status === "awaiting_approval" ? "Approve" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-[#0A0A0A] p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="text-sm text-muted">Close</button>
            <h2 className="page-title mt-2 text-xl text-white">{selected.title}</h2>
            <div className="agent-name mt-1 text-xs text-muted">{agentNameById[selected.agent_id] || "—"}</div>
            <div className="mt-4 flex gap-2">
              <Badge value={selected.status} />
              <Badge value={selected.risk_level} />
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Created</div>
                <div className="text-[#CCCCCC]">{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              {selected.description ? (
                <div>
                  <div className="text-xs font-semibold uppercase text-muted">Description</div>
                  <p className="mt-1 text-muted">{selected.description}</p>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Plan</div>
                {selected.plan && selected.plan.length > 0 ? (
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-[#CCCCCC]">
                    {selected.plan.map((s: any, i: number) => (
                      <li key={i}>{s.description}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-muted">No plan yet. Full step-by-step plan and tool call log available under Audit → Replay once this task has run.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
