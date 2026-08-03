"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { mockTasks } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/tasks

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "running", label: "Running" },
  { key: "awaiting_approval", label: "Needs approval" },
  { key: "failed", label: "Failed" },
] as const;

export default function TasksPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [selected, setSelected] = useState<typeof mockTasks[number] | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mockTasks.length };
    for (const f of FILTERS) {
      if (f.key === "all") continue;
      c[f.key] = mockTasks.filter((t) => t.status === f.key).length;
    }
    return c;
  }, []);

  const filtered = filter === "all" ? mockTasks : mockTasks.filter((t) => t.status === filter);

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Every task an agent has run or is running, across the company."
        action={
          <button className="control flex items-center gap-2 border border-border px-3 py-2 text-sm text-[#CCCCCC]">
            Last 30 days <ChevronDown size={14} />
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`control flex items-center gap-1.5 border px-3 py-1.5 text-sm ${
              filter === f.key ? "border-white bg-[#1A1A1A] text-white" : "border-border text-[#CCCCCC]"
            }`}
          >
            {f.label}
            <span className="rounded-full bg-[#1A1A1A] px-1.5 py-0.5 text-[10px] text-muted">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer border-b border-border last:border-0 hover:bg-[#141414]">
                <td className="px-4 py-3"><Badge value={t.status} /></td>
                <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                <td className="agent-name px-4 py-3 text-xs text-muted">{t.agent}</td>
                <td className="px-4 py-3 text-muted">{t.time}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={`control px-3 py-1.5 text-xs font-medium ${
                      t.status === "awaiting_approval"
                        ? "bg-[#22C55E] text-black"
                        : t.status === "failed"
                        ? "border border-border text-[#CCCCCC]"
                        : "border border-border text-[#CCCCCC]"
                    }`}
                  >
                    {t.status === "awaiting_approval" ? "Approve" : t.status === "failed" ? "Retry" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-[#0A0A0A] p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="text-sm text-muted">Close</button>
            <h2 className="page-title mt-2 text-xl text-white">{selected.title}</h2>
            <div className="agent-name mt-1 text-xs text-muted">{selected.agent}</div>
            <div className="mt-4 flex gap-2">
              <Badge value={selected.status} />
              <Badge value={selected.risk} />
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase text-muted">Created</div>
                <div className="text-[#CCCCCC]">{selected.created}</div>
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
