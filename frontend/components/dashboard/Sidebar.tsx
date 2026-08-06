"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ListChecks, Package, Truck, FileText, BarChart3, Plug, Settings,
  Search, ChevronLeft, ChevronRight, HelpCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { openOnboardingGuide } from "@/components/OnboardingGuide";

function useNavItems() {
  const { t } = useI18n();
  return [
    { href: "/dashboard", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/cariler", label: t("nav_cariler"), icon: Users },
    { href: "/siparisler", label: t("nav_orders"), icon: ListChecks },
    { href: "/urunler", label: t("nav_products"), icon: Package },
    { href: "/sevkiyat", label: t("nav_shipments"), icon: Truck },
    { href: "/faturalar", label: t("nav_invoices"), icon: FileText },
    { href: "/reports", label: t("nav_reports"), icon: BarChart3 },
    { href: "/integrations", label: t("nav_integrations"), icon: Plug },
    { href: "/settings", label: t("nav_settings"), icon: Settings },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();
  const [me, setMe] = useState<any | null>(null);
  const NAV_ITEMS = useNavItems();

  useEffect(() => {
    api.me().then(setMe).catch(() => {});
  }, []);

  const initials = me?.full_name
    ? me.full_name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase()
    : "··";

  if (collapsed) {
    return (
      <aside className="flex h-screen w-14 flex-col items-center border-r border-border bg-sidebar py-5">
        <button onClick={() => setCollapsed(false)} className="mb-6 text-muted hover:text-white">
          <ChevronRight size={16} />
        </button>
        <LogoMark />
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-5 py-5">
        <LogoMark />
        <button onClick={() => setCollapsed(true)} className="text-muted hover:text-white">
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="control flex items-center gap-2 border border-border bg-[#0A0A0A] px-3 py-2">
          <Search size={14} className="text-muted" />
          <input
            placeholder={t("search_placeholder")}
            className="w-full bg-transparent text-[13px] text-white placeholder:text-muted outline-none"
          />
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">⌘K</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-control px-3 py-2 text-sm transition-colors ${
                    active ? "bg-[#1A1A1A] text-white" : "text-[#CCCCCC] hover:bg-[#141414]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} strokeWidth={1.75} />
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={openOnboardingGuide}
            title={t("open_guide")}
            className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm text-[#CCCCCC] hover:bg-[#141414]"
          >
            <HelpCircle size={16} strokeWidth={1.75} />
            {t("open_guide")}
          </button>
        </div>
      </nav>

      <div className="border-t border-border px-4 py-3">
        <Link href="/settings" className="flex items-center gap-3 rounded-control px-2 py-2 hover:bg-[#141414]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-white">{me?.full_name || "…"}</div>
            <div className="truncate text-xs text-muted">{me?.role || "Member"}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function LogoMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Phratic" style={{ height: 36, width: "auto" }} />
  );
}
