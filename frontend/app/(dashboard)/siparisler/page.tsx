"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const STATUSES = ["draft", "confirmed", "shipped", "invoiced"] as const;
const DEFERRED_OPTIONS = [60, 90, 120, 150];

export default function OrdersPage() {
  const { t, formatMoney } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [cariler, setCariler] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [cariId, setCariId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [installment, setInstallment] = useState("tek_cekim");
  const [deferredDays, setDeferredDays] = useState(60);
  const [items, setItems] = useState<{ product_id: string; quantity: number }[]>([{ product_id: "", quantity: 1 }]);

  async function load() {
    setLoading(true);
    try {
      const [o, c, p] = await Promise.all([api.orders(), api.cariler(), api.products()]);
      setOrders(o || []);
      setCariler(c || []);
      setProducts(p || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cariNameById = Object.fromEntries(cariler.map((c) => [c.id, c.name]));
  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  function updateItem(idx: number, patch: Partial<{ product_id: string; quantity: number }>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createOrder({
        cari_id: cariId,
        payment_method: paymentMethod,
        installment: paymentMethod === "credit_card" ? installment : "",
        deferred_days: paymentMethod === "deferred" ? deferredDays : null,
        items: items.filter((it) => it.product_id && it.quantity > 0),
      });
      setShowForm(false);
      setCariId(""); setPaymentMethod("cash"); setItems([{ product_id: "", quantity: 1 }]);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function advanceStatus(order: any) {
    const idx = STATUSES.indexOf(order.status);
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
    await api.updateOrderStatus(order.id, next);
    load();
  }

  return (
    <div>
      <PageHeader
        title={t("page_orders_title")}
        subtitle={t("page_orders_subtitle")}
        action={
          <button onClick={() => setShowForm(true)} className="control flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-medium text-black">
            <Plus size={14} /> {t("create_order")}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("all")} className={`control border px-3 py-1.5 text-xs font-medium ${statusFilter === "all" ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>{t("actions")}</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`control border px-3 py-1.5 text-xs font-medium ${statusFilter === s ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>
            {t(`order_status_${s}`)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t("loading")}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t("empty_state")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("order_number")}</th>
                <th className="px-4 py-3 font-medium">{t("select_cari")}</th>
                <th className="px-4 py-3 font-medium">{t("payment_method")}</th>
                <th className="px-4 py-3 font-medium">{t("order_total")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="agent-name px-4 py-3 text-xs text-white">{o.order_number}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{cariNameById[o.cari_id] || "—"}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{t(`payment_${o.payment_method}`)}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{formatMoney(o.total)}</td>
                  <td className="px-4 py-3"><Badge value={o.status}>{t(`order_status_${o.status}`)}</Badge></td>
                  <td className="px-4 py-3">
                    {o.status !== "invoiced" ? (
                      <button onClick={() => advanceStatus(o)} className="text-xs text-muted underline hover:text-white">
                        {t(`order_status_${STATUSES[Math.min(STATUSES.indexOf(o.status) + 1, STATUSES.length - 1)]}`)}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="card w-full max-w-xl overflow-hidden border border-border bg-[#0D0D0D] p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="page-title text-lg text-white">{t("create_order")}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">{t("select_cari")}</span>
                <select value={cariId} onChange={(e) => setCariId(e.target.value)} required className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
                  <option value="">—</option>
                  {cariler.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <div>
                <span className="mb-1 block text-xs text-muted">{t("select_products")}</span>
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select value={it.product_id} onChange={(e) => updateItem(idx, { product_id: e.target.value })} className="control flex-1 border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
                        <option value="">—</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })} className="control w-24 border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none" />
                      <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} className="text-muted hover:text-[#F87171]"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setItems((prev) => [...prev, { product_id: "", quantity: 1 }])} className="text-xs text-muted underline hover:text-white">+ {t("add")}</button>
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs text-muted">{t("payment_method")}</span>
                <div className="flex gap-2">
                  {(["cash", "credit_card", "deferred"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`control flex-1 border px-3 py-2 text-xs font-medium ${paymentMethod === m ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>
                      {t(`payment_${m}`)}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "credit_card" ? (
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">{t("installment_label")}</span>
                  <select value={installment} onChange={(e) => setInstallment(e.target.value)} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
                    <option value="tek_cekim">{t("installment_single")}</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="7">7</option>
                  </select>
                </label>
              ) : null}

              {paymentMethod === "deferred" ? (
                <label className="block">
                  <span className="mb-1 block text-xs text-muted">{t("deferred_days_label")}</span>
                  <select value={deferredDays} onChange={(e) => setDeferredDays(Number(e.target.value))} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
                    {DEFERRED_OPTIONS.map((d) => <option key={d} value={d}>{d} {t("date").toLowerCase()}</option>)}
                  </select>
                </label>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)} className="control border border-border px-4 py-2 text-xs text-[#CCCCCC]">{t("cancel")}</button>
              <button type="submit" disabled={saving || !cariId} className="control bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-50">{saving ? t("saving") : t("create_order")}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
