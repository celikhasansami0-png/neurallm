"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { IntegrationLogo, INTEGRATION_APPS, appLabel, CATEGORY_BY_APP } from "@/components/dashboard/IntegrationLogo";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const CATEGORIES = ["All", "Communication", "CRM", "Dev Tools", "Productivity", "Finance", "Storage", "Marketing"];

const CATALOG = INTEGRATION_APPS.map((slug) => ({
  slug,
  name: appLabel(slug),
  category: CATEGORY_BY_APP[slug] || "Productivity",
}));

export default function IntegrationsPage() {
  const { t } = useI18n();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.integrations();
      setConnections(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load integrations.");
    } finally {
      setLoading(false);
    }
  }

  const connectedSlugs = useMemo(() => new Set(connections.map((c) => c.tool_slug)), [connections]);

  const filtered = useMemo(
    () =>
      CATALOG.filter(
        (i) => (category === "All" || i.category === category) && i.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category]
  );

  const connected = filtered.filter((i) => connectedSlugs.has(i.slug));
  const rest = filtered.filter((i) => !connectedSlugs.has(i.slug));

  async function connect(app: (typeof CATALOG)[number]) {
    setConnectingSlug(app.slug);
    try {
      const res = await api.connectIntegration({ tool_slug: app.slug, display_name: app.name, category: app.category });
      if (res?.redirect_url) {
        window.open(res.redirect_url, "_blank");
      }
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to start connection.");
    } finally {
      setConnectingSlug(null);
    }
  }

  async function disconnect(connectionId: string) {
    try {
      await api.disconnectIntegration(connectionId);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect.");
    }
  }

  return (
    <div>
      <PageHeader title={t("nav_integrations")} subtitle={t("page_integrations_subtitle")} />

      {error ? <p className="mb-4 text-sm text-[#F87171]">{error}</p> : null}

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

      {loading ? (
        <div className="py-20 text-center text-sm text-muted">{t("loading")}</div>
      ) : (
        <>
          {connected.length > 0 ? (
            <div className="mt-8">
              <div className="mb-3 text-sm font-semibold text-white">Connected</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {connected.map((i) => {
                  const conn = connections.find((c) => c.tool_slug === i.slug);
                  return (
                    <div key={i.slug} className="card flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <IntegrationLogo app={i.slug} size={28} />
                        <div>
                          <div className="text-sm font-medium text-white">{i.name}</div>
                          <div className="text-xs text-muted">{i.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => conn && disconnect(conn.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#22C55E] hover:text-[#F87171]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                        Connected
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-3 text-sm font-semibold text-white">{category === "All" ? "All integrations" : category}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((i) => (
                <div key={i.slug} className="card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <IntegrationLogo app={i.slug} size={28} />
                    <div>
                      <div className="text-sm font-medium text-white">{i.name}</div>
                      <div className="text-xs text-muted">{i.category}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => connect(i)}
                    disabled={connectingSlug === i.slug}
                    className="control border border-border px-3 py-1.5 text-xs font-medium text-[#CCCCCC] disabled:opacity-50"
                  >
                    {connectingSlug === i.slug ? "Connecting…" : "Connect"}
                  </button>
                </div>
              ))}
              {rest.length === 0 ? <div className="col-span-full py-8 text-center text-sm text-muted">{t("empty_state")}</div> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
