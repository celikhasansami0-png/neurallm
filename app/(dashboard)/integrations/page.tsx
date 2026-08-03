"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { IntegrationLogo } from "@/components/dashboard/IntegrationLogo";
import { mockIntegrations } from "@/lib/mock-data";
import { Search } from "lucide-react";
// TODO: replace with live API call to /api/v1/integrations + POST connect

const CATEGORIES = ["All", "Email", "Calendar", "Engineering", "Communication", "Docs", "CRM", "Finance"];

export default function IntegrationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () =>
      mockIntegrations.filter(
        (i) =>
          (category === "All" || i.category === category) &&
          i.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category]
  );

  const connected = filtered.filter((i) => i.connected);
  const popular = filtered.filter((i) => !i.connected);

  return (
    <div>
      <PageHeader title="Integrations" subtitle="Connect the tools your agents need through secure OAuth (powered by Composio)." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="control flex flex-1 items-center gap-2 border border-border bg-[#111111] px-3 py-2">
          <Search size={16} className="text-muted" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations…" className="w-full bg-transparent text-sm text-white placeholder:text-muted outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c} onClick={() => setCategory(c)}
              className={`control px-3 py-1.5 text-xs font-medium ${category === c ? "bg-white text-black" : "border border-border text-[#CCCCCC]"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {connected.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 text-sm font-semibold text-white">Connected</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((i) => (
              <div key={i.name} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <IntegrationLogo app={i.slug} size={28} />
                  <div>
                    <div className="text-sm font-medium text-white">{i.name}</div>
                    <div className="text-xs text-muted">{i.category}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#22C55E]">Connected</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 text-sm font-semibold text-white">Popular</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((i) => (
            <div key={i.name} className="card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <IntegrationLogo app={i.slug} size={28} />
                <div>
                  <div className="text-sm font-medium text-white">{i.name}</div>
                  <div className="text-xs text-muted">{i.category}</div>
                </div>
              </div>
              <button className="control border border-border px-3 py-1.5 text-xs font-medium text-[#CCCCCC]">Connect</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
