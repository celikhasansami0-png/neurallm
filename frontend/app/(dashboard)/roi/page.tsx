"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockROI, mockAgents } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// TODO: replace with live API call to /api/v1/roi

const perAgent = mockAgents.map((a, i) => ({
  name: a.name,
  tasksCompleted: [14, 9, 22, 7, 11, 18][i] ?? 5,
  actions: [31, 18, 47, 12, 20, 39][i] ?? 10,
}));

export default function ROIPage() {
  const totalHours = mockROI.reduce((s, m) => s + m.hoursSaved, 0);
  const totalDollars = mockROI.reduce((s, m) => s + m.dollarsSaved, 0);

  return (
    <div>
      <PageHeader title="ROI" subtitle="What running agents instead of manual work has saved your team." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-muted">Total hours saved</div>
          <div className="mt-2 text-2xl font-semibold">{totalHours}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Estimated dollars saved</div>
          <div className="mt-2 text-2xl font-semibold">${totalDollars.toLocaleString()}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-muted">Tasks completed</div>
          <div className="mt-2 text-2xl font-semibold">{perAgent.reduce((s, a) => s + a.tasksCompleted, 0)}</div>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <div className="mb-4 text-sm font-semibold">Hours saved over time</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={mockROI}>
            <CartesianGrid stroke="#E5E5E5" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#737373" }} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "0.5px solid #E5E5E5" }} />
            <Area type="monotone" dataKey="hoursSaved" stroke="#000000" fill="#F5F5F5" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Tasks completed</th>
              <th className="px-4 py-3 font-medium">Tool actions</th>
            </tr>
          </thead>
          <tbody>
            {perAgent.map((a) => (
              <tr key={a.name} className="border-b border-border last:border-0">
                <td className="agent-name px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3">{a.tasksCompleted}</td>
                <td className="px-4 py-3">{a.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
