"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ListChecks, Users, Wallet } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const DOT_COLOR: Record<string, string> = {
  draft: "bg-[#444444]",
  confirmed: "bg-[#F59E0B]",
  shipped: "bg-[#3B82F6]",
  invoiced: "bg-[#22C55E]",
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const { t, formatMoney } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [cariler, setCariler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ordersRes, paymentsRes, carilerRes, meRes] = await Promise.all([
          api.orders().catch(() => []),
          api.payments().catch(() => []),
          api.cariler().catch(() => []),
          api.me().catch(() => null),
        ]);
        if (cancelled) return;
        setOrders(ordersRes || []);
        setPayments(paymentsRes || []);
        setCariler(carilerRes || []);
        if (meRes?.full_name) setUserName(meRes.full_name.split(" ")[0]);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter((o) => (o.created_at || "").slice(0, 10) === today).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const activeCariler = cariler.filter((c) => c.is_active !== false).length;

  const cariNameById = useMemo(() => Object.fromEntries(cariler.map((c) => [c.id, c.name])), [cariler]);

  const orderVolume = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      if (!o.created_at) continue;
      const d = new Date(o.created_at).toISOString().slice(0, 10);
      counts[d] = (counts[d] || 0) + 1;
    }
    const days: { day: string; orders: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, orders: counts[key] || 0 });
    }
    return days;
  }, [orders]);

  const paymentStatusChart = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, paid: 0, overdue: 0 };
    for (const p of payments) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return [
      { name: t("payment_status_pending"), count: counts.pending },
      { name: t("payment_status_paid"), count: counts.paid },
      { name: t("payment_status_overdue"), count: counts.overdue },
    ];
  }, [payments, t]);

  const recentActivity = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 8)
      .map((o) => ({
        id: o.id,
        cari: cariNameById[o.cari_id] || "—",
        text: `${o.order_number} — ${formatMoney(o.total)}`,
        status: o.status,
        time: timeAgo(o.updated_at || o.created_at),
      }));
  }, [orders, cariNameById, formatMoney]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted">{t("loading_dashboard")}</div>;
  }

  return (
    <div>
      <h1 className="page-title text-[38px] text-foreground">{t("greeting", { name: userName })}</h1>
      <p className="mt-1 text-[13px] text-muted">{t("greeting_subtitle")}</p>
      {error ? <p className="mt-2 text-sm text-[#F87171]">{error}</p> : null}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label={t("metric_orders_today")}
          icon={<ListChecks size={16} className="text-muted" />}
          value={ordersToday}
          change={`${orders.length} total orders`}
          positive
        />
        <MetricCard
          label={t("metric_pending_payments")}
          icon={<Wallet size={16} className="text-muted" />}
          value={pendingPayments}
          change="Awaiting settlement"
        />
        <MetricCard
          label={t("metric_active_cariler")}
          icon={<Users size={16} className="text-muted" />}
          value={activeCariler}
          change={activeCariler > 0 ? "All active" : "No customers yet"}
          positive={activeCariler > 0}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">{t("chart_order_volume")} (30 {t("date").toLowerCase()})</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={orderVolume}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Line type="monotone" dataKey="orders" stroke="#FFFFFF" strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 text-sm font-semibold text-white">{t("chart_payment_status")}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentStatusChart}>
              <CartesianGrid className="dotted-grid" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#444444" }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#444444" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111111", border: "0.5px solid #1A1A1A", borderRadius: 8, color: "#FFFFFF" }} />
              <Bar dataKey="count" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <div className="mb-3 text-sm font-semibold text-white">{t("recent_activity")}</div>
        {recentActivity.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">{t("no_activity")}</div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[a.status] || "bg-[#444444]"}`} />
                <span className="agent-name shrink-0 text-xs text-muted">{a.cari}</span>
                <span className="flex-1 truncate text-sm text-[#CCCCCC]">{a.text}</span>
                <span className="shrink-0 text-xs text-muted">{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label, icon, value, change, positive,
}: { label: string; icon: React.ReactNode; value: number; change: string; positive?: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        {icon}
      </div>
      <div className="page-title mt-3 text-[32px] text-white">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>
        {positive ? <ArrowUpRight size={12} /> : null}
        {change}
      </div>
    </div>
  );
}
