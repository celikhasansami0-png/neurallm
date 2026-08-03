"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockTasks } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/tasks (filtered to awaiting_approval) + POST approve/reject

export default function ApprovalsPage() {
  const [tasks, setTasks] = useState(mockTasks.filter((t) => t.status === "awaiting_approval"));

  function decide(id: string, decision: "approved" | "rejected") {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <PageHeader title="Approvals" subtitle="High-risk actions pause here until a human signs off. Target SLA: 60 seconds or less." />

      {tasks.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">Nothing waiting on you right now.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="agent-name mt-0.5 text-xs text-muted">{t.agent}</div>
                </div>
                <Badge value={t.risk} />
              </div>
              <p className="mt-3 text-xs text-muted">Requested {t.created} · 60 seconds or less SLA</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => decide(t.id, "approved")} className="control bg-black px-4 py-2 text-sm font-medium text-white">Approve</button>
                <button onClick={() => decide(t.id, "rejected")} className="control border border-border px-4 py-2 text-sm font-medium">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
