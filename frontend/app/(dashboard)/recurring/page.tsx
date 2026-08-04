"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockRecurring } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/recurring

export default function RecurringPage() {
  return (
    <div>
      <PageHeader
        title="Recurring"
        subtitle="Standing jobs your agents run on a schedule."
        action={<button className="control bg-white px-4 py-2 text-sm font-medium text-black">New recurring task</button>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockRecurring.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="text-sm font-semibold">{r.title}</div>
              <Badge value={r.active ? "completed" : "pending"}>{r.active ? "Active" : "Paused"}</Badge>
            </div>
            <div className="agent-name mt-1 text-xs text-muted">{r.agent}</div>
            <div className="mt-4 text-xs text-muted">Schedule</div>
            <div className="agent-name text-sm">{r.cron}</div>
            <div className="mt-2 text-xs text-muted">Last run {r.lastRun}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
