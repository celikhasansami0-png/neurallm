"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { InstallPrompt, installDismissedKey } from "@/components/InstallPrompt";
import { OnboardingGuide } from "@/components/OnboardingGuide";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(installDismissedKey());
    setShowInstall(!seen && !isStandalone());
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (showInstall) {
    return <InstallPrompt onDone={() => setShowInstall(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      <OnboardingGuide />
    </div>
  );
}
