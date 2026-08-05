"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "agent"; agent: string; content: string; task: any };

export default function AssistantPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents().then(setAgents).catch(() => setAgents([]));
  }, []);

  const totalStepsUsed = useMemo(
    () =>
      messages
        .filter((m): m is Extract<Message, { role: "agent" }> => m.role === "agent")
        .reduce((sum, m) => sum + (m.task?.plan?.length || 0), 0),
    [messages]
  );

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    if (agents.length === 0) {
      setError("No agents available yet. Create one under Agents first.");
      return;
    }
    const content = input;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      // Route to the CEO by default (mirrors the backend's fallback route - see
      // app/services/langgraph_router.py); a dedicated streaming chat endpoint would replace
      // this with real routing once the orchestrator exposes one.
      const target = agents.find((a) => a.name === "CEO") || agents[0];
      const task = await api.createTask({ agent_id: target.id, title: content });
      const agentMsg: Message = {
        id: `a-${task.id}`,
        role: "agent",
        agent: target.name,
        content:
          task.status === "awaiting_approval"
            ? `This request needs human approval before ${target.name} can proceed. Check Approvals.`
            : task.status === "failed"
            ? `${target.name} hit an error while working on this.`
            : `${target.name} worked through this task. Here's what happened:`,
        task,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setExpanded((prev) => ({ ...prev, [agentMsg.id]: true }));
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-bold text-white">Assistant</h1>
          <p className="mt-0.5 text-sm text-muted">{totalStepsUsed} plan steps run this session</p>
        </div>
        {sending ? <Badge value="running">Working</Badge> : null}
      </div>

      {error ? <p className="mb-3 text-sm text-[#F87171]">{error}</p> : null}

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            Ask Managent to do something — e.g. "Draft the Q3 board update".
          </div>
        ) : null}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-lg rounded-card bg-[#1A1A1A] px-4 py-3 text-sm text-white">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#CCCCCC]">
                <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse-glow" />
                {m.agent} · Managent
              </div>
              <div className="card p-4 text-sm text-[#CCCCCC]">
                <p>{m.content}</p>
                {m.task?.plan?.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => toggle(m.id)}
                      className="flex w-full items-center justify-between rounded-control border border-border px-3 py-2"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">Execution plan</div>
                        <div className="text-xs text-muted">{m.task.plan.length} steps</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge value={m.task.status} />
                        {expanded[m.id] ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                      </div>
                    </button>
                    {expanded[m.id] ? (
                      <div className="space-y-1 rounded-control border border-border px-3 py-2">
                        {m.task.plan.map((s: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 py-1">
                            <Check size={14} className="mt-0.5 shrink-0 text-[#22C55E]" />
                            <div>
                              <div className="text-sm text-white">{s.description}</div>
                              {s.tool ? <div className="tool-detail mt-0.5 text-xs text-muted">{s.tool}</div> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-control border border-border bg-[#111111] px-2 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Managent anything…"
          disabled={sending}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none disabled:opacity-50"
        />
        <button onClick={handleSend} disabled={sending} className="control bg-white p-2 text-black disabled:opacity-50">
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
