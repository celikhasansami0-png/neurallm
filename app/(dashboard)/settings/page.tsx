"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company configuration, API access, and notification preferences." />

      <div className="card p-5">
        <div className="text-sm font-semibold text-white">Company</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted">Company name</label>
            <input defaultValue="Quantum²" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Plan</label>
            <input defaultValue="Team" disabled className="control w-full border border-border bg-[#111111] px-3 py-2 text-sm text-muted" />
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">API key</div>
        <p className="mt-1 text-xs text-muted">Use this key to authenticate server-to-server requests against the Quantum² API.</p>
        <div className="agent-name control mt-3 flex items-center justify-between border border-border bg-[#111111] px-3 py-2 text-sm text-white">
          <span>q2_live_••••••••••••••••••••3f2a</span>
          <button className="text-xs font-medium text-[#CCCCCC] underline">Reveal</button>
        </div>
        <button className="control mt-2 border border-border px-3 py-1.5 text-xs font-medium text-[#CCCCCC]">Rotate key</button>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">Webhook URL</div>
        <p className="mt-1 text-xs text-muted">Quantum² will POST task and approval events here.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/quantum2"
            className="control flex-1 border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted"
          />
          <button className="control border border-border px-4 py-2 text-sm font-medium text-[#CCCCCC]">Send test event</button>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">Notifications</div>
        <div className="mt-3 space-y-2 text-sm text-[#CCCCCC]">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            Email me when a task needs approval
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifySlack} onChange={(e) => setNotifySlack(e.target.checked)} />
            Post approval requests to Slack
          </label>
        </div>
      </div>

      <div className="mt-6 card border-[#F87171]/30 p-5">
        <div className="text-sm font-semibold text-[#F87171]">Danger zone</div>
        <p className="mt-1 text-xs text-muted">Deleting your workspace removes all agents, tasks, and audit history. This cannot be undone.</p>
        <button className="control mt-3 border border-[#F87171]/30 px-4 py-2 text-sm font-medium text-[#F87171]">Delete workspace</button>
      </div>
    </div>
  );
}
