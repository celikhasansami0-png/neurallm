"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ListChecks, ShieldCheck, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";

const DOT_COLOR: Record<string, string> = {
  completed: "bg-[#22C55E]",
  running: "bg-[#F59E0B]",
  awaiting_approval: "bg-[#F59E0B]",
  approved: "bg-[#F59E0B]",
  pending: "bg-[#F59E0B]",
  failed: "bg-[#F87171]",
  rejected: "bg-[#F87171]",
};

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

export default function DashboardPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [agentsRes, tasksRes, meRes] = await Promise.all([api.agents(), api.tasks(), api.me().catch(() => null)]);
        if (cancelled) return;
        setAgents(agentsRes || []);
        setTasks(tasksRes || []);
        if (meRes?.full_name) setUserName(meRes.full_name.split(" ")[0]);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeAgents = agents.filter((a) => a.is_active).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingApprovals = tasks.filter((t) => t.status === "awaiting_approval").length;

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  const taskVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (!t.created_at) continue;
      const d = new Date(t.created_at).toISOString().slice(0, 10);
      counts[d] = (counts[d] || 0) + 1;
    }
    const days: { day: string; tasks: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, tasks: counts[key] || 0 });
    }
    return days;
  }, [tasks]);

  const agentPerformance = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.agent_id] = (counts[t.agent_id] || 0) + 1;
    }
    return agents.map((a) => ({ name: a.name, tasks: counts[a.id] || 0 }));
  }, [agents, tasks]);

  const recentActivity = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 8)
      .map((t) => ({
        id: t.id,
        agent: agentNameById[t.agent_id] || "Unknown agent",
        text: `${t.status === "completed" ? "Completed" : t.status === "failed" ? "Failed" : t.status === "awaiting_approval" ? "Awaiting approval on" : "Working on"} "${t.title}"`,
        status: t.status,
        time: timeAgo(t.updated_at || t.created_at),
      }));
  }, [tasks, agentNameById]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted">Loading your dashboard…</div>;
  }

  return (
    <div>
      <h1 className="page-title text-[38px] text-foreground">Good Morning, {userName}.</h1>
      <p className="mt-1 text-[13px] text-muted">Here's what's happening today.</p>
      {error ? <p className="mt-2 text-sm text-[#F87171]">{error}</p> : null}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Tasks Completed"
          icon={<ListChecks size={16} className="text-muted" />}
          value={completedCount}
          change={`${tasks.length} total tasks`}
          positive
        />
        <MetricCard
          label="Pending Approvals"
          icon={<ShieldCheck size={16} className="text-muted" />}
          value={pendingApprovals}
          change="Awaiting review"
        />
        <MetricCard
          label="Active Agents"
          icon={<Users size={16} className="text-muted" />}
          value={activeAgents}
          change={activeAgents > 0 ? "All online" : "No agents yet"}
          positive={activeAgents > 0}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Task Volume (30 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={taskVolume}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Line type="monotone" dataKey="tasks" stroke="#FFFFFF" strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Agent Performance</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agentPerformance}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Bar dataKey="tasks" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <div className="mb-3 text-sm font-semibold text-white">Recent Activity</div>
        {recentActivity.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">No activity yet. Create a task to get started.</div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[a.status] || "bg-[#444444]"}`} />
                <span className="agent-name shrink-0 text-xs text-muted">{a.agent}</span>
                <span className="flex-1 truncate text-sm text-[#CCCCCC]">{a.text}</span>
                <span className="shrink-0 text-xs text-muted">{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label, icon, value, change, positive,
}: { label: string; icon: React.ReactNode; value: number; change: string; positive?: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        {icon}
      </div>
      <div className="page-title mt-3 text-[32px] text-white">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>
        {positive ? <ArrowUpRight size={12} /> : null}
        {change}
      </div>
    </div>
  );
}
