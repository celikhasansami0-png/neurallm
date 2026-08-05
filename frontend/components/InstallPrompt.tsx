"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Apple, Chrome } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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

export function installDismissedKey() {
  return `managent_install_seen_${getUserKey()}`;
}

export function InstallPrompt({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  }

  function handleSkip() {
    window.localStorage.setItem(installDismissedKey(), "1");
    onDone();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Managent" style={{ height: 36, width: "auto" }} />
        </div>

        <h1 className="page-title text-[32px] text-white">{t("install_title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("install_subtitle")}</p>

        {installed ? (
          <div className="mt-8 card p-6">
            <p className="text-sm text-white">{t("install_done")}</p>
          </div>
        ) : (
          <>
            <button
              onClick={handleInstall}
              className="control mt-8 w-full bg-white py-3 text-sm font-medium text-black"
            >
              {t("install_now")}
            </button>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <InstallStep icon={<Apple size={16} />} title={t("install_mac_title")} steps={t("install_mac_steps")} />
              <InstallStep icon={<Monitor size={16} />} title={t("install_windows_title")} steps={t("install_windows_steps")} />
              <InstallStep icon={<Smartphone size={16} />} title={t("install_iphone_title")} steps={t("install_iphone_steps")} />
              <InstallStep icon={<Chrome size={16} />} title={t("install_android_title")} steps={t("install_android_steps")} />
            </div>

            <button onClick={handleSkip} className="mt-6 text-sm text-muted underline hover:text-white">
              {t("install_skip")}
            </button>
          </>
        )}

        {installed ? (
          <button onClick={handleSkip} className="control mt-6 w-full border border-border py-2.5 text-sm font-medium text-white">
            {t("install_skip")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InstallStep({ icon, title, steps }: { icon: React.ReactNode; title: string; steps: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-xs text-muted">{steps}</p>
    </div>
  );
}
