"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, ListChecks, RefreshCw, ShieldCheck,
  Workflow, Users, BookOpen, Plug, Building2, TrendingUp, Settings, Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck, badge: 2 },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/company", label: "Company", icon: Building2 },
  { href: "/roi", label: "ROI", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

const CHAT_HISTORY = {
  Today: ["Draft Q3 board update", "Summarize investor thread"],
  Yesterday: ["Triage GitHub issues", "Budget approval review"],
  "Last 7 days": ["Onboarding PRD draft", "Vendor contract review", "Weekly digest"],
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">NeuraLLM</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-control px-3 py-2 text-sm transition-colors ${
                    active ? "bg-black text-white" : "text-foreground hover:bg-[#F5F5F5]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} strokeWidth={1.75} />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Chats</span>
          </div>
          <button className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-control border border-border px-3 py-1.5 text-sm hover:bg-[#F5F5F5]">
            <Plus size={14} /> New Chat
          </button>
          {Object.entries(CHAT_HISTORY).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="px-3 py-1 text-[11px] font-medium text-muted">{group}</div>
              {items.map((title) => (
                <div key={title} className="truncate px-3 py-1 text-sm text-foreground hover:bg-[#F5F5F5] rounded-control cursor-pointer">
                  {title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-border px-4 py-3">
        <Link href="/settings" className="flex items-center gap-3 rounded-control px-2 py-2 hover:bg-[#F5F5F5]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">Sarah Chen</div>
            <div className="truncate text-xs text-muted">Admin · Settings</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
