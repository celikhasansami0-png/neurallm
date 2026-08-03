"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";

// TODO: replace with live chat session pulled from /api/v1/tasks + streamed orchestrator output.
type ToolCallRow = { id: string; label: string; detail: string };
type ToolGroup = {
  id: string;
  integration: string;
  actionsCompleted: number;
  status: "completed" | "running" | "awaiting_approval";
  calls: ToolCallRow[];
};
type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "agent"; agent: string; content: string; groups: ToolGroup[] };

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", role: "user", content: "Draft the Q3 board update and check for any blocking GitHub issues before I send it." },
  {
    id: "m2", role: "agent", agent: "CEO",
    content: "I routed this to CEO Office for the draft and Software Engineer for the issue check. Here's what happened:",
    groups: [
      {
        id: "g1", integration: "Gmail", actionsCompleted: 2, status: "completed",
        calls: [
          { id: "c1", label: "Fetched last board update thread", detail: "gmail.search_messages(query='Q3 board update')" },
          { id: "c2", label: "Drafted follow-up email", detail: "gmail.create_draft(to='board@acme.com')" },
        ],
      },
      {
        id: "g2", integration: "GitHub", actionsCompleted: 1, status: "completed",
        calls: [
          { id: "c3", label: "Checked open blocking issues", detail: "github.list_issues(label='blocker', state='open') -> 0 found" },
        ],
      },
      {
        id: "g3", integration: "Gmail", actionsCompleted: 0, status: "awaiting_approval",
        calls: [
          { id: "c4", label: "Send draft to board@acme.com", detail: "gmail.send_email(to='board@acme.com') — outbound, requires approval" },
        ],
      },
    ],
  },
];

function statusBadgeValue(status: ToolGroup["status"]) {
  return status;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ g1: true, g2: true, g3: true });

  const totalToolsUsed = messages
    .filter((m): m is Extract<Message, { role: "agent" }> => m.role === "agent")
    .reduce((sum, m) => sum + m.groups.reduce((s, g) => s + g.calls.length, 0), 0);

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // TODO: POST to /api/v1/tasks and stream the orchestrator's response back into this thread.
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold">Assistant</h1>
          <p className="mt-0.5 text-sm text-muted">Assistant · {totalToolsUsed} tools used</p>
        </div>
        <Badge value="running">Live</Badge>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-lg rounded-card bg-black px-4 py-3 text-sm text-white">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="max-w-2xl">
              <div className="agent-name mb-1 text-xs font-semibold text-muted">{m.agent}</div>
              <div className="card p-4 text-sm">
                <p>{m.content}</p>
                <div className="mt-4 space-y-2">
                  {m.groups.map((g) => (
                    <div key={g.id} className="rounded-control border border-border">
                      <button
                        onClick={() => toggle(g.id)}
                        className="flex w-full items-center justify-between px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{g.integration}</span>
                          <span className="text-xs text-muted">{g.actionsCompleted} actions completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge value={statusBadgeValue(g.status)} />
                          {expanded[g.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>
                      {expanded[g.id] ? (
                        <div className="space-y-1 border-t border-border px-3 py-2">
                          {g.calls.map((c) => (
                            <div key={c.id} className="flex items-start gap-2 py-1">
                              <Check size={14} className="mt-0.5 shrink-0 text-[#22C55E]" />
                              <div>
                                <div className="text-sm">{c.label}</div>
                                <div className="agent-name mt-0.5 text-xs text-muted">{c.detail}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask NeuraLLM anything… (@ to mention an agent)"
          className="control flex-1 border border-border px-4 py-3 text-sm outline-none focus:border-black"
        />
        <button onClick={handleSend} className="control bg-black p-3 text-white">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
