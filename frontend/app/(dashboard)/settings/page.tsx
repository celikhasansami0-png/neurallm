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
        <div className="text-sm font-semibold">Company</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted">Company name</label>
            <input defaultValue="Acme Inc." className="control w-full border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Plan</label>
            <input defaultValue="Team" disabled className="control w-full border border-border bg-[#FAFAFA] px-3 py-2 text-sm text-muted" />
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold">API key</div>
        <p className="mt-1 text-xs text-muted">Use this key to authenticate server-to-server requests against the NeuraLLM API.</p>
        <div className="agent-name control mt-3 flex items-center justify-between border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
          <span>nlm_live_••••••••••••••••••••3f2a</span>
          <button className="text-xs font-medium underline">Reveal</button>
        </div>
        <button className="control mt-2 border border-border px-3 py-1.5 text-xs font-medium">Rotate key</button>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold">Webhook URL</div>
        <p className="mt-1 text-xs text-muted">NeuraLLM will POST task and approval events here.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/neurallm"
            className="control flex-1 border border-border px-3 py-2 text-sm"
          />
          <button className="control border border-border px-4 py-2 text-sm font-medium">Send test event</button>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold">Notifications</div>
        <div className="mt-3 space-y-2 text-sm">
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

      <div className="mt-6 card border-[#FECACA] p-5">
        <div className="text-sm font-semibold text-[#991B1B]">Danger zone</div>
        <p className="mt-1 text-xs text-muted">Deleting your workspace removes all agents, tasks, and audit history. This cannot be undone.</p>
        <button className="control mt-3 border border-[#FECACA] px-4 py-2 text-sm font-medium text-[#991B1B]">Delete workspace</button>
      </div>
    </div>
  );
}
