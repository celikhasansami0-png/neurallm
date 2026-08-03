"use client";

import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockROI, mockAgents } from "@/lib/mock-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// TODO: replace with live API call to /api/v1/roi

const perAgentCost = mockAgents.map((a, i) => ({
  name: a.name,
  cost: [42, 68, 91, 35, 54, 77][i] ?? 20,
}));

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="What running agents instead of manual work has cost and saved your team."
        action={
          <div className="flex items-center gap-2">
            <button className="control flex items-center gap-2 border border-border px-3 py-2 text-sm text-[#CCCCCC]">
              Last 6 months <ChevronDown size={14} />
            </button>
            <button className="control flex items-center gap-2 border border-border px-3 py-2 text-sm text-[#CCCCCC]">
              All agents <ChevronDown size={14} />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Transaction Volume by Month</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockROI}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Line type="monotone" dataKey="dollarsSaved" stroke="#FFFFFF" strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">Agent Performance Cost</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perAgentCost}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Bar dataKey="cost" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Tasks completed</th>
              <th className="px-4 py-3 font-medium">Est. cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {perAgentCost.map((a, i) => (
              <tr key={a.name} className="border-b border-border last:border-0">
                <td className="agent-name px-4 py-3 font-medium text-white">{a.name}</td>
                <td className="px-4 py-3 text-[#CCCCCC]">{mockAgents[i]?.tasksThisWeek ?? "—"}</td>
                <td className="px-4 py-3 text-[#CCCCCC]">${a.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
