"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockTasks } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/tasks

export default function TasksPage() {
  const [selected, setSelected] = useState<typeof mockTasks[number] | null>(null);

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Every task an agent has run or is running, across the company." />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {mockTasks.map((t) => (
              <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer border-b border-border last:border-0 hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="agent-name px-4 py-3 text-xs text-muted">{t.agent}</td>
                <td className="px-4 py-3"><Badge value={t.status} /></td>
                <td className="px-4 py-3"><Badge value={t.risk} /></td>
                <td className="px-4 py-3 text-muted">{t.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/20" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="text-sm text-muted">Close</button>
            <h2 className="mt-2 text-lg font-semibold">{selected.title}</h2>
            <div className="agent-name mt-1 text-xs text-muted">{selected.agent}</div>
            <div className="mt-4 flex gap-2">
              <Badge value={selected.status} />
              <Badge value={selected.risk} />
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Created</div>
                <div>{selected.created}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Plan</div>
                <p className="mt-1 text-muted">Full step-by-step plan and tool call log available under Audit → Replay once this task has real execution data.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
