"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockTasks } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/tasks (filtered to awaiting_approval) + POST approve/reject

const ACTION_DESCRIPTIONS: Record<string, string> = {
  t2: "CEO Office wants to send an email to board@quantum2.app with the investor follow-up draft attached.",
  t4: "CFO wants to approve a 12% increase to the Q4 marketing spend budget, moving $18,400 from reserve.",
};

export default function ApprovalsPage() {
  const [tasks, setTasks] = useState(mockTasks.filter((t) => t.status === "awaiting_approval"));

  function decide(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <PageHeader title="Approvals" subtitle="High-risk actions pause here until a human signs off." />

      <div className="mb-6 flex items-center gap-2 rounded-control border border-border bg-[#111111] px-4 py-3 text-sm text-[#CCCCCC]">
        <Clock size={14} className="text-muted" />
        Actions are processed in under 60 seconds
      </div>

      {tasks.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">Nothing waiting on you right now.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span className="agent-name">{t.agent}</span>
                    <span>·</span>
                    <span>{t.time}</span>
                  </div>
                </div>
                <Badge value={t.risk} />
              </div>
              <p className="mt-3 text-sm text-[#CCCCCC]">
                {ACTION_DESCRIPTIONS[t.id] || `${t.agent} is requesting approval to proceed with this action.`}
              </p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => decide(t.id)} className="control bg-white px-4 py-2 text-sm font-medium text-black">Approve</button>
                <button onClick={() => decide(t.id)} className="control border border-[#F87171]/40 px-4 py-2 text-sm font-medium text-[#F87171]">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
