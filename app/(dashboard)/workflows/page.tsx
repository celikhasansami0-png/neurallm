"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAgents } from "@/lib/mock-data";
// TODO: replace with live API call to /api/v1/workflows

const ACTIONS = ["Draft document", "Send for approval", "Post update", "Create GitHub issue", "Summarize thread"];

type Step = { agent: string; action: string };

export default function WorkflowsPage() {
  const [name, setName] = useState("");
  const [chain, setChain] = useState<Step[]>([{ agent: mockAgents[0].name, action: ACTIONS[0] }]);
  const [workflows, setWorkflows] = useState<{ name: string; chain: Step[] }[]>([
    { name: "New hire onboarding", chain: [{ agent: "CEO Office", action: "Draft document" }, { agent: "Product Manager", action: "Post update" }] },
  ]);

  function addStep() {
    setChain((c) => [...c, { agent: mockAgents[0].name, action: ACTIONS[0] }]);
  }

  function updateStep(i: number, field: keyof Step, value: string) {
    setChain((c) => c.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function saveWorkflow() {
    if (!name.trim()) return;
    setWorkflows((w) => [...w, { name, chain }]);
    setName("");
    setChain([{ agent: mockAgents[0].name, action: ACTIONS[0] }]);
  }

  return (
    <div>
      <PageHeader title="Workflows" subtitle="Chain agents together into a repeatable, ordered sequence." />

      <div className="card p-5">
        <div className="text-sm font-semibold">Build a workflow</div>
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name"
          className="control mt-3 w-full border border-border px-3 py-2 text-sm"
        />
        <div className="mt-4 space-y-2">
          {chain.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted">{i + 1}.</span>
              <select value={step.agent} onChange={(e) => updateStep(i, "agent", e.target.value)} className="control border border-border px-2 py-1.5 text-sm">
                {mockAgents.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
              <span className="text-muted">→</span>
              <select value={step.action} onChange={(e) => updateStep(i, "action", e.target.value)} className="control border border-border px-2 py-1.5 text-sm">
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={addStep} className="control border border-border px-4 py-2 text-sm">Add step</button>
          <button onClick={saveWorkflow} className="control bg-white px-4 py-2 text-sm text-black">Save workflow</button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {workflows.map((w, i) => (
          <div key={i} className="card p-5">
            <div className="text-sm font-semibold">{w.name}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              {w.chain.map((s, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="agent-name">{s.agent}</span>
                  <span className="text-xs">({s.action})</span>
                  {idx < w.chain.length - 1 ? <span>→</span> : null}
                </span>
              ))}
            </div>
            <button className="control mt-3 border border-border px-3 py-1.5 text-xs font-medium">Run now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
