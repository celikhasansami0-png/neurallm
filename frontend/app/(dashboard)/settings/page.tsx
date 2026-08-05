"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n, LANGUAGES } from "@/lib/i18n";

const PLAN_LABELS: Record<string, string> = { trial: "Trial", team: "Team", business: "Business" };

function daysLeft(iso: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);

  const [billing, setBilling] = useState<any | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<"team" | "business" | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    api.getWebhookConfig().then((res) => setWebhookUrl(res?.webhook_url || "")).catch(() => {});
    loadBilling();
  }, []);

  async function loadBilling() {
    setBillingLoading(true);
    try {
      const res = await api.billingStatus();
      setBilling(res);
    } catch (err: any) {
      setBillingError(err.message || "Failed to load billing status.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function saveWebhook() {
    setWebhookSaving(true);
    setWebhookMessage(null);
    try {
      await api.setWebhookConfig(webhookUrl);
      setWebhookMessage("Saved.");
    } catch (err: any) {
      setWebhookMessage(err.message || "Failed to save webhook URL.");
    } finally {
      setWebhookSaving(false);
    }
  }

  async function testWebhook() {
    setWebhookTesting(true);
    setWebhookMessage(null);
    try {
      const res = await api.testWebhook(webhookUrl || undefined);
      setWebhookMessage(res.ok ? `Test event delivered (HTTP ${res.status_code}).` : `Delivery failed: ${res.error || res.status_code}`);
    } catch (err: any) {
      setWebhookMessage(err.message || "Failed to send test event.");
    } finally {
      setWebhookTesting(false);
    }
  }

  async function upgrade(plan: "team" | "business") {
    setCheckoutLoading(plan);
    setBillingError(null);
    try {
      const res = await api.createCheckoutSession(plan);
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      setBillingError(err.message || "Failed to start checkout. Billing may not be configured yet.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  const trialDaysLeft = billing ? daysLeft(billing.trial_ends_at) : null;
  const { t, lang, setLang } = useI18n();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company configuration, API access, and notification preferences." />

      <div className="card p-5">
        <div className="text-sm font-semibold text-white">{t("language")}</div>
        <div className="mt-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="control w-full max-w-xs border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white sm:w-auto"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">Company</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted">Company name</label>
            <input defaultValue="Managent" className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Plan</label>
            <input
              value={billing ? PLAN_LABELS[billing.plan] || billing.plan : "…"} disabled
              className="control w-full border border-border bg-[#111111] px-3 py-2 text-sm text-muted"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">Billing</div>
        <p className="mt-1 text-xs text-muted">Manage your Managent subscription.</p>

        {billingError ? <p className="mt-2 text-sm text-[#F87171]">{billingError}</p> : null}

        {billingLoading ? (
          <div className="mt-4 text-sm text-muted">Loading billing status…</div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3">
              <span className="rounded-full border border-border bg-[#1A1A1A] px-3 py-1 text-xs font-medium text-white">
                {PLAN_LABELS[billing?.plan] || billing?.plan} plan
              </span>
              <span className="text-xs text-muted">Status: {billing?.subscription_status}</span>
              {trialDaysLeft !== null ? (
                <span className="text-xs text-[#F59E0B]">{trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in trial</span>
              ) : null}
            </div>
            {!billing?.billing_configured ? (
              <p className="mt-2 text-xs text-muted">Billing isn't configured on this server yet, so upgrade checkout isn't available.</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => upgrade("team")}
                disabled={checkoutLoading !== null || !billing?.billing_configured}
                className="control bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {checkoutLoading === "team" ? "Redirecting…" : "Upgrade to Team — $299/mo"}
              </button>
              <button
                onClick={() => upgrade("business")}
                disabled={checkoutLoading !== null || !billing?.billing_configured}
                className="control border border-border px-4 py-2 text-sm font-medium text-[#CCCCCC] disabled:opacity-50"
              >
                {checkoutLoading === "business" ? "Redirecting…" : "Upgrade to Business — $799/mo"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">API key</div>
        <p className="mt-1 text-xs text-muted">Use this key to authenticate server-to-server requests against the Managent API.</p>
        <div className="agent-name control mt-3 flex items-center justify-between border border-border bg-[#111111] px-3 py-2 text-sm text-white">
          <span>q2_live_••••••••••••••••••••3f2a</span>
          <button className="text-xs font-medium text-[#CCCCCC] underline">Reveal</button>
        </div>
        <button className="control mt-2 border border-border px-3 py-1.5 text-xs font-medium text-[#CCCCCC]">Rotate key</button>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold text-white">Webhook URL</div>
        <p className="mt-1 text-xs text-muted">Managent will POST task and approval events here.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/managent"
            className="control flex-1 border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-muted"
          />
          <button onClick={saveWebhook} disabled={webhookSaving} className="control border border-border px-4 py-2 text-sm font-medium text-[#CCCCCC] disabled:opacity-50">
            {webhookSaving ? "Saving…" : "Save"}
          </button>
          <button onClick={testWebhook} disabled={webhookTesting} className="control border border-border px-4 py-2 text-sm font-medium text-[#CCCCCC] disabled:opacity-50">
            {webhookTesting ? "Sending…" : "Send test event"}
          </button>
        </div>
        {webhookMessage ? <p className="mt-2 text-xs text-muted">{webhookMessage}</p> : null}
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
