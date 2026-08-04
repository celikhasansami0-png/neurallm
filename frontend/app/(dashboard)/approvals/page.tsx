"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";

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

export default function ApprovalsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [tasksRes, agentsRes] = await Promise.all([api.tasks(), api.agents().catch(() => [])]);
      setTasks((tasksRes || []).filter((t: any) => t.status === "awaiting_approval"));
      setAgents(agentsRes || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      if (approve) await api.approveTask(id);
      else await api.rejectTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Approvals" subtitle="High-risk actions pause here until a human signs off." />

      <div className="mb-6 flex items-center gap-2 rounded-control border border-border bg-[#111111] px-4 py-3 text-sm text-[#CCCCCC]">
        <Clock size={14} className="text-muted" />
        Actions are processed in under 60 seconds
      </div>

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      {loading ? (
        <div className="py-20 text-center text-sm text-muted">Loading approvals…</div>
      ) : tasks.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">Nothing waiting on you right now.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span className="agent-name">{agentNameById[t.agent_id] || "—"}</span>
                    <span>·</span>
                    <span>{timeAgo(t.created_at)}</span>
                  </div>
                </div>
                <Badge value={t.risk_level} />
              </div>
              <p className="mt-3 text-sm text-[#CCCCCC]">
                {t.description || `${agentNameById[t.agent_id] || "This agent"} is requesting approval to proceed with this action.`}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  disabled={busyId === t.id}
                  onClick={() => decide(t.id, true)}
                  className="control bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {busyId === t.id ? "Working…" : "Approve"}
                </button>
                <button
                  disabled={busyId === t.id}
                  onClick={() => decide(t.id, false)}
                  className="control border border-[#F87171]/40 px-4 py-2 text-sm font-medium text-[#F87171] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
