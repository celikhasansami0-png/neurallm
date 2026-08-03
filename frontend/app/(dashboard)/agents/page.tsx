"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAgents } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/agents

export default function AgentsPage() {
  const [view, setView] = useState<"grid" | "org">("grid");
  const [showModal, setShowModal] = useState(false);

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
              <button onClick={() => setView("grid")} className={`control px-3 py-1.5 ${view === "grid" ? "bg-black text-white" : ""}`}>Grid</button>
              <button onClick={() => setView("org")} className={`control px-3 py-1.5 ${view === "org" ? "bg-black text-white" : ""}`}>Org chart</button>
            </div>
            <button onClick={() => setShowModal(true)} className="control bg-black px-4 py-2 text-sm font-medium text-white">Add Agent</button>
          </div>
        }
      />

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockAgents.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="agent-name text-sm font-semibold">{a.name}</div>
              <div className="mt-0.5 text-xs text-muted">{a.org_position}</div>
              <div className="mt-3 text-xs text-muted">Level {a.level}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {a.tools.map((t) => (
                  <span key={t} className="control border border-border px-2 py-0.5 text-[11px]">{t}</span>
                ))}
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
                  <div key={a.id} className="card px-4 py-3">
                    <div className="agent-name text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-muted">{a.org_position}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Add Agent</h2>
            <div className="mt-4 space-y-3">
              <input placeholder="Agent name" className="control w-full border border-border px-3 py-2 text-sm" />
              <input placeholder="Org position" className="control w-full border border-border px-3 py-2 text-sm" />
              <input placeholder="Level (1-4)" type="number" className="control w-full border border-border px-3 py-2 text-sm" />
              <textarea placeholder="System prompt" rows={3} className="control w-full border border-border px-3 py-2 text-sm" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="control border border-border px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => setShowModal(false)} className="control bg-black px-4 py-2 text-sm text-white">Create agent</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
