"use client";

import { useEffect, useState } from "react";
import { Plus, X, FileText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type Cari = {
  id: string; type: string; name: string; contact_name: string; phone: string; email: string;
  address: string; tax_number: string; payment_terms: string; credit_limit: number; currency: string;
  balance: number; is_active: boolean;
};

export default function CarilerPage() {
  const { t, formatMoney } = useI18n();
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "customer" | "supplier">("all");
  const [showForm, setShowForm] = useState(false);
  const [statementFor, setStatementFor] = useState<Cari | null>(null);
  const [statement, setStatement] = useState<any | null>(null);
  const [form, setForm] = useState({
    type: "customer", name: "", contact_name: "", phone: "", email: "", address: "",
    tax_number: "", payment_terms: "", credit_limit: 0,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.cariler();
      setCariler(res || []);
    } catch {
      setCariler([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = cariler.filter((c) => filter === "all" || c.type === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCari(form);
      setShowForm(false);
      setForm({ type: "customer", name: "", contact_name: "", phone: "", email: "", address: "", tax_number: "", payment_terms: "", credit_limit: 0 });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function openStatement(cari: Cari) {
    setStatementFor(cari);
    setStatement(null);
    try {
      const res = await api.cariStatement(cari.id);
      setStatement(res);
    } catch {
      setStatement({ entries: [], outstanding: 0 });
    }
  }

  return (
    <div>
      <PageHeader
        title={t("page_cariler_title")}
        subtitle={t("page_cariler_subtitle")}
        action={
          <button onClick={() => setShowForm(true)} className="control flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-medium text-black">
            <Plus size={14} /> {t("add_cari")}
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        {(["all", "customer", "supplier"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`control border px-3 py-1.5 text-xs font-medium ${filter === f ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}
          >
            {f === "all" ? t("actions") : f === "customer" ? t("cari_type_customer") : t("cari_type_supplier")}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t("empty_state")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("name")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("phone")}</th>
                <th className="px-4 py-3 font-medium">{t("cari_payment_terms")}</th>
                <th className="px-4 py-3 font-medium">{t("cari_balance")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{c.type === "customer" ? t("cari_type_customer") : t("cari_type_supplier")}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{c.phone}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{c.payment_terms}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{formatMoney(c.balance)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openStatement(c)} className="flex items-center gap-1 text-xs text-muted hover:text-white">
                      <FileText size={12} /> {t("cari_statement")}
                    </button>
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
              <h2 className="page-title text-lg text-white">{t("add_cari")}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-5">
              <div className="flex gap-2">
                {(["customer", "supplier"] as const).map((ty) => (
                  <button key={ty} type="button" onClick={() => setForm({ ...form, type: ty })}
                    className={`control flex-1 border px-3 py-2 text-xs font-medium ${form.type === ty ? "border-white bg-white text-black" : "border-border text-[#CCCCCC]"}`}>
                    {ty === "customer" ? t("cari_type_customer") : t("cari_type_supplier")}
                  </button>
                ))}
              </div>
              <Field label={t("name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label={t("cari_contact")} value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
              <Field label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label={t("email")} value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label={t("address")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Field label={t("tax_number")} value={form.tax_number} onChange={(v) => setForm({ ...form, tax_number: v })} />
              <Field label={t("cari_payment_terms")} value={form.payment_terms} onChange={(v) => setForm({ ...form, payment_terms: v })} />
              <Field label={t("cari_credit_limit")} type="number" value={String(form.credit_limit)} onChange={(v) => setForm({ ...form, credit_limit: Number(v) || 0 })} />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)} className="control border border-border px-4 py-2 text-xs text-[#CCCCCC]">{t("cancel")}</button>
              <button type="submit" disabled={saving} className="control bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-50">{saving ? t("saving") : t("save")}</button>
            </div>
          </form>
        </div>
      ) : null}

      {statementFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg overflow-hidden border border-border bg-[#0D0D0D] p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="page-title text-lg text-white">{t("cari_statement")} — {statementFor.name}</h2>
              <button onClick={() => setStatementFor(null)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {!statement ? (
                <div className="py-8 text-center text-sm text-muted">{t("loading")}</div>
              ) : statement.entries.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted">{t("empty_state")}</div>
              ) : (
                <div className="space-y-2">
                  {statement.entries.map((e: any) => (
                    <div key={e.order_id} className="flex items-center justify-between border-b border-border pb-2 text-sm">
                      <div>
                        <div className="text-white">{e.order_number}</div>
                        <div className="text-xs text-muted">{new Date(e.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#CCCCCC]">{formatMoney(e.amount)}</div>
                        <div className="text-xs text-muted">{formatMoney(e.running_balance)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-right text-sm font-semibold text-white">
                    {t("cari_balance")}: {formatMoney(statement.outstanding)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white/40"
      />
    </label>
  );
}
