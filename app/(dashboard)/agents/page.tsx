"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAgents } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/agents

export default function AgentsPage() {
  const [view, setView] = useState<"grid" | "org">("grid");
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(mockAgents.map((a) => [a.id, a.active]))
  );

  const byLevel = mockAgents.reduce<Record<number, typeof mockAgents>>((acc, a) => {
    (acc[a.level] = acc[a.level] || []).push(a);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Your company's org chart of AI executors."
        action={
          <div className="flex items-center gap-2">
            <div className="control flex border border-border p-0.5 text-sm">
              <button onClick={() => setView("grid")} className={`control px-3 py-1.5 ${view === "grid" ? "bg-white text-black" : "text-[#CCCCCC]"}`}>Grid</button>
              <button onClick={() => setView("org")} className={`control px-3 py-1.5 ${view === "org" ? "bg-white text-black" : "text-[#CCCCCC]"}`}>Org chart</button>
            </div>
            <button onClick={() => setShowModal(true)} className="control bg-white px-4 py-2 text-sm font-medium text-black">Add Agent</button>
          </div>
        }
      />

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockAgents.map((a) => (
            <div key={a.id} className="card group p-5 transition-colors hover:border-[#333333]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#22C55E]/30 bg-[#1A2E1F] px-2 py-0.5 text-[11px] font-medium text-[#22C55E]">Active</span>
                  <span className="rounded-full border border-border bg-[#1A1A1A] px-2 py-0.5 text-[11px] text-muted">Level {a.level}</span>
                </div>
                <ToggleSwitch
                  checked={active[a.id]}
                  onChange={() => setActive((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                />
              </div>
              <div className="agent-name mt-4 text-lg font-semibold text-white">{a.name}</div>
              <p className="mt-1 text-sm text-muted">{a.org_position}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.tools.map((t) => (
                  <span key={t} className="agent-name rounded-control bg-[#1A1A1A] px-2 py-0.5 text-[11px] text-[#CCCCCC]">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted">{a.tasksThisWeek} tasks this week</span>
                <button className="text-xs font-medium text-[#CCCCCC] hover:text-white">Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, agents]) => (
            <div key={level}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Level {level}</div>
              <div className="flex flex-wrap gap-3">
                {agents.map((a) => (
                  <div key={a.id} className="card px-4 py-3 transition-colors hover:border-[#333333]">
                    <div className="agent-name text-sm font-semibold text-white">{a.name}</div>
                    <div className="text-xs text-muted">{a.org_position}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="page-title text-xl text-white">Add Agent</h2>
            <div className="mt-4 space-y-3">
              <input placeholder="Agent name" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none" />
              <input placeholder="Org position" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none" />
              <input placeholder="Level (1-4)" type="number" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none" />
              <textarea placeholder="System prompt" rows={3} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="control border border-border px-4 py-2 text-sm text-[#CCCCCC]">Cancel</button>
              <button onClick={() => setShowModal(false)} className="control bg-white px-4 py-2 text-sm text-black">Create agent</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#22C55E]" : "bg-[#1A1A1A]"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}
