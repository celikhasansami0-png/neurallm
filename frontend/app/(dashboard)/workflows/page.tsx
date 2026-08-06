"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ACTIONS = ["Draft document", "Send for approval", "Post update", "Create GitHub issue", "Summarize thread"];

type Step = { agent_id: string; action: string };

export default function WorkflowsPage() {
  const { t } = useI18n();
  const [agents, setAgents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [chain, setChain] = useState<Step[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [agentsRes, workflowsRes] = await Promise.all([api.agents(), api.workflows()]);
      setAgents(agentsRes || []);
      setWorkflows(workflowsRes || []);
      if ((agentsRes || []).length > 0) {
        setChain([{ agent_id: agentsRes[0].id, action: ACTIONS[0] }]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load workflows.");
    } finally {
      setLoading(false);
    }
  }

  const agentNameById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a.name])), [agents]);

  function addStep() {
    if (agents.length === 0) return;
    setChain((c) => [...c, { agent_id: agents[0].id, action: ACTIONS[0] }]);
  }

  function updateStep(i: number, field: keyof Step, value: string) {
    setChain((c) => c.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function saveWorkflow() {
    if (!name.trim() || chain.length === 0) return;
    setSaving(true);
    try {
      await api.createWorkflow({ name, chain });
      setName("");
      setChain(agents.length > 0 ? [{ agent_id: agents[0].id, action: ACTIONS[0] }] : []);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to save workflow.");
    } finally {
      setSaving(false);
    }
  }

  async function runWorkflow(id: string) {
    setRunningId(id);
    try {
      await api.runWorkflow(id);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to run workflow.");
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div>
      <PageHeader title={t("page_workflows_title")} subtitle={t("page_workflows_subtitle")} />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

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
              <select value={step.agent_id} onChange={(e) => updateStep(i, "agent_id", e.target.value)} className="control border border-border px-2 py-1.5 text-sm">
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <span className="text-muted">→</span>
              <select value={step.action} onChange={(e) => updateStep(i, "action", e.target.value)} className="control border border-border px-2 py-1.5 text-sm">
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          ))}
          {chain.length === 0 && !loading ? (
            <p className="text-xs text-muted">Create an agent first under Agents to build a workflow.</p>
          ) : null}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={addStep} disabled={agents.length === 0} className="control border border-border px-4 py-2 text-sm disabled:opacity-50">Add step</button>
          <button onClick={saveWorkflow} disabled={saving || chain.length === 0} className="control bg-white px-4 py-2 text-sm text-black disabled:opacity-50">
            {saving ? "Saving…" : "Save workflow"}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted">Loading workflows…</div>
        ) : workflows.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted">No workflows yet. Build one above.</div>
        ) : (
          workflows.map((w) => (
            <div key={w.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{w.name}</div>
                <span className="text-xs text-muted">{w.status}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {(w.chain || []).map((s: any, idx: number) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="agent-name">{agentNameById[s.agent_id] || s.agent_id}</span>
                    <span className="text-xs">({s.action})</span>
                    {idx < w.chain.length - 1 ? <span>→</span> : null}
                  </span>
                ))}
              </div>
              {w.last_run_result?.summary ? (
                <p className="mt-2 text-xs text-muted">{w.last_run_result.summary}</p>
              ) : null}
              <button
                onClick={() => runWorkflow(w.id)}
                disabled={runningId === w.id}
                className="control mt-3 border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                {runningId === w.id ? "Running…" : "Run now"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
