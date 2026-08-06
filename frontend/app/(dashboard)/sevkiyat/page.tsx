"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/dashboard/Badge";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const STATUSES = ["pending", "preparing", "shipped", "delivered"] as const;
const ADDRESS_TYPES = ["santiye", "depo", "acik_adres"] as const;
const DELIVERY_TIMES = ["acil", "fabrikaya_bagli", "tarihli"] as const;

export default function ShipmentsPage() {
  const { t } = useI18n();
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    order_id: "", address_type: "acik_adres", address_text: "", city: "", district: "",
    delivery_time: "tarihli", delivery_date: "", recipient_name: "", recipient_phone: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([api.shipments(), api.orders()]);
      setShipments(s || []);
      setOrders(o || []);
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const orderNumberById = Object.fromEntries(orders.map((o) => [o.id, o.order_number]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createShipment({ ...form, delivery_date: form.delivery_date || null });
      setShowForm(false);
      setForm({ order_id: "", address_type: "acik_adres", address_text: "", city: "", district: "", delivery_time: "tarihli", delivery_date: "", recipient_name: "", recipient_phone: "" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function advanceStatus(s: any) {
    const idx = STATUSES.indexOf(s.status);
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
    await api.updateShipmentStatus(s.id, next);
    load();
  }

  return (
    <div>
      <PageHeader
        title={t("page_shipments_title")}
        subtitle={t("page_shipments_subtitle")}
        action={
          <button onClick={() => setShowForm(true)} className="control flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-medium text-black">
            <Plus size={14} /> {t("add_shipment")}
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t("loading")}</div>
        ) : shipments.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t("empty_state")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("order_number")}</th>
                <th className="px-4 py-3 font-medium">{t("city")}</th>
                <th className="px-4 py-3 font-medium">{t("delivery_time")}</th>
                <th className="px-4 py-3 font-medium">{t("recipient_name")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td className="agent-name px-4 py-3 text-xs text-white">{orderNumberById[s.order_id] || "—"}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{s.city}{s.district ? ` / ${s.district}` : ""}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{t(`delivery_${s.delivery_time}`)}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{s.recipient_name}</td>
                  <td className="px-4 py-3"><Badge value={s.status}>{t(`shipment_status_${s.status}`)}</Badge></td>
                  <td className="px-4 py-3">
                    {s.status !== "delivered" ? (
                      <button onClick={() => advanceStatus(s)} className="text-xs text-muted underline hover:text-white">
                        {t(`shipment_status_${STATUSES[Math.min(STATUSES.indexOf(s.status) + 1, STATUSES.length - 1)]}`)}
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
          <form onSubmit={handleSubmit} className="card w-full max-w-lg overflow-hidden border border-border bg-[#0D0D0D] p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="page-title text-lg text-white">{t("add_shipment")}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="max-h-[65vh] space-y-3 overflow-y-auto px-6 py-5">
              <label className="block">
                <span className="mb-1 block text-xs text-muted">{t("order_number")}</span>
                <select value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })} required className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
                  <option value="">—</option>
                  {orders.map((o) => <option key={o.id} value={o.id}>{o.order_number}</option>)}
                </select>
              </label>

              <div>
                <span className="mb-1 block text-xs text-muted">{t("shipment_address_type")}</span>
                <div className="flex gap-2">
                  {ADDRESS_TYPES.map((a) => (
                    <button key={a} type="button" onClick={() => setForm({ ...form, address_type: a })} className={`control flex-1 border px-2 py-2 text-xs font-medium ${form.address_type === a ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>
                      {t(`address_${a}`)}
                    </button>
                  ))}
                </div>
              </div>

              <Field label={t("address")} value={form.address_text} onChange={(v) => setForm({ ...form, address_text: v })} />
              <div className="flex gap-2">
                <Field label={t("city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label={t("district")} value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
              </div>

              <div>
                <span className="mb-1 block text-xs text-muted">{t("delivery_time")}</span>
                <div className="flex gap-2">
                  {DELIVERY_TIMES.map((d) => (
                    <button key={d} type="button" onClick={() => setForm({ ...form, delivery_time: d })} className={`control flex-1 border px-2 py-2 text-xs font-medium ${form.delivery_time === d ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>
                      {t(`delivery_${d}`)}
                    </button>
                  ))}
                </div>
              </div>
              {form.delivery_time === "tarihli" ? (
                <Field label={t("delivery_date")} type="date" value={form.delivery_date} onChange={(v) => setForm({ ...form, delivery_date: v })} />
              ) : null}

              <div className="flex gap-2">
                <Field label={t("recipient_name")} value={form.recipient_name} onChange={(v) => setForm({ ...form, recipient_name: v })} />
                <Field label={t("recipient_phone")} value={form.recipient_phone} onChange={(v) => setForm({ ...form, recipient_phone: v })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)} className="control border border-border px-4 py-2 text-xs text-[#CCCCCC]">{t("cancel")}</button>
              <button type="submit" disabled={saving || !form.order_id} className="control bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-50">{saving ? t("saving") : t("save")}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white/40" />
    </label>
  );
}
