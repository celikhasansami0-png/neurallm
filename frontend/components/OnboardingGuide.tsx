"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard, MessageSquare, Users, ListChecks, ShieldCheck, Workflow, Plug, X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const STEP_ICONS = [
  LayoutDashboard, MessageSquare, Users, ListChecks, ShieldCheck, Workflow, Plug,
];

const STEP_KEYS = [
  "dashboard", "assistant", "agents", "tasks", "approvals", "workflows", "integrations",
] as const;

function getUserKey(): string {
  if (typeof window === "undefined") return "anon";
  try {
    const token = window.localStorage.getItem("managent_token");
    if (!token) return "anon";
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || payload.email || "anon";
  } catch {
    return "anon";
  }
}

function guideSeenKey() {
  return `managent_guide_seen_${getUserKey()}`;
}

export function OnboardingGuide() {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = window.localStorage.getItem(guideSeenKey());
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    function handleOpen() {
      setStep(0);
      setOpen(true);
    }
    window.addEventListener("managent:open-guide", handleOpen);
    return () => window.removeEventListener("managent:open-guide", handleOpen);
  }, []);

  function close() {
    window.localStorage.setItem(guideSeenKey(), "1");
    setOpen(false);
  }

  if (!open) return null;

  const total = STEP_KEYS.length;
  const key = STEP_KEYS[step];
  const Icon = STEP_ICONS[step];
  const isLast = step === total - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      dir={dir}
    >
      <div className="w-full max-w-md card overflow-hidden border border-border bg-[#0D0D0D] p-0 shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="page-title text-xl text-white">{t("guide_title")}</h2>
            <p className="mt-1 text-xs text-muted">{t("guide_intro")}</p>
          </div>
          <button onClick={close} className="text-muted hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[#141414]">
            <Icon size={24} className="text-white" strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-center text-base font-semibold text-white">
            {t(`guide_step_${key}_title`)}
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#CCCCCC]">
            {t(`guide_step_${key}_body`)}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="flex items-center gap-1.5">
            {STEP_KEYS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === step ? "bg-white" : "bg-[#333333]"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="control border border-border px-3 py-1.5 text-xs font-medium text-[#CCCCCC]"
              >
                {t("guide_back")}
              </button>
            ) : (
              <button onClick={close} className="text-xs text-muted underline hover:text-white">
                {t("guide_skip")}
              </button>
            )}
            <button
              onClick={() => (isLast ? close() : setStep((s) => s + 1))}
              className="control bg-white px-4 py-1.5 text-xs font-medium text-black"
            >
              {isLast ? t("guide_done") : t("guide_next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function openOnboardingGuide() {
  window.dispatchEvent(new Event("managent:open-guide"));
}
