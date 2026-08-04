"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mirrors the backend's rough cost model (see app/routers/roi.py): each completed task is
// assumed to save 20 minutes of human work at $60/hr, i.e. $20/completed task.
const DOLLARS_SAVED_PER_TASK = 20;

export default function ReportsPage() {
  const [roi, setRoi] = useState<any | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [roiRes, agentsRes, tasksRes] = await Promise.all([api.roi(), api.agents(), api.tasks()]);
        setRoi(roiRes);
        setAgents(agentsRes || []);
        setTasks(tasksRes || []);
      } catch (err: any) {
        setError(err.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  const perAgent = useMemo(() => {
    const breakdown: { agent_id: string; actions_completed: number }[] = roi?.per_agent_breakdown || [];
    return agents.map((a) => {
      const row = breakdown.find((b) => b.agent_id === a.id);
      return { name: a.name, actions: row?.actions_completed || 0 };
    });
  }, [agents, roi]);

  const monthly = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.status !== "completed" || !t.created_at) continue;
      const d = new Date(t.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const months: { month: string; dollarsSaved: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        dollarsSaved: (counts[key] || 0) * DOLLARS_SAVED_PER_TASK,
      });
    }
    return months;
  }, [tasks]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted">Loading reports…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="What running agents instead of manual work has cost and saved your team."
      />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-muted">Tasks completed</div>
          <div className="page-title mt-2 text-[28px] text-white">{roi?.tasks_completed ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Hours saved</div>
          <div className="page-title mt-2 text-[28px] text-white">{roi?.hours_saved ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Estimated dollars saved</div>
          <div className="page-title mt-2 text-[28px] text-white">${roi?.estimated_dollars_saved ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Estimated Savings by Month</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthly}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Line type="monotone" dataKey="dollarsSaved" stroke="#FFFFFF" strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Actions Completed by Agent</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perAgent}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Bar dataKey="actions" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Actions completed</th>
            </tr>
          </thead>
          <tbody>
            {perAgent.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-muted">No agent activity yet.</td>
              </tr>
            ) : (
              perAgent.map((a) => (
                <tr key={a.name} className="border-b border-border last:border-0">
                  <td className="agent-name px-4 py-3 font-medium text-white">{a.name}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{a.actions}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
