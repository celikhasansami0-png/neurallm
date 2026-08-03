"use client";

import { ArrowUpRight, ListChecks, ShieldCheck, Users } from "lucide-react";
import { mockAgents, mockTasks, mockTaskVolume, mockAgentPerformance, mockRecentActivity } from "@/lib/mock-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// TODO: replace with live API call to /api/v1/roi, /api/v1/tasks, /api/v1/agents

const DOT_COLOR: Record<string, string> = {
  completed: "bg-[#22C55E]",
  running: "bg-[#F59E0B]",
  awaiting_approval: "bg-[#F59E0B]",
  failed: "bg-[#F87171]",
};

export default function DashboardPage() {
  const activeAgents = mockAgents.length;
  const completedToday = mockTasks.filter((t) => t.status === "completed").length;
  const pendingApprovals = mockTasks.filter((t) => t.status === "awaiting_approval").length;

  const userName = "Hasan";

  return (
    <div>
      <h1 className="page-title text-[38px] text-foreground">Good Morning, {userName}.</h1>
      <p className="mt-1 text-[13px] text-muted">Here's what's happening today.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Tasks Completed Today"
          icon={<ListChecks size={16} className="text-muted" />}
          value={completedToday}
          change="+3 vs yesterday"
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
          change="All online"
          positive
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Task Volume</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockTaskVolume}>
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
            <BarChart data={mockAgentPerformance}>
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
        <div className="divide-y divide-border">
          {mockRecentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[a.status] || "bg-[#444444]"}`} />
              <span className="agent-name shrink-0 text-xs text-muted">{a.agent}</span>
              <span className="flex-1 truncate text-sm text-[#CCCCCC]">{a.text}</span>
              <span className="shrink-0 text-xs text-muted">{a.time}</span>
            </div>
          ))}
        </div>
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
