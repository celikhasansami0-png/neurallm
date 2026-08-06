"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type Product = {
  id: string; sku: string; name: string; unit: string; price: number; currency: string;
  tax_rate: number; stock_quantity: number; is_active: boolean;
};

export default function ProductsPage() {
  const { t, formatMoney } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", unit: "adet", price: 0, tax_rate: 20, stock_quantity: 0 });

  async function load() {
    setLoading(true);
    try {
      setProducts((await api.products()) || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createProduct(form);
      setShowForm(false);
      setForm({ sku: "", name: "", unit: "adet", price: 0, tax_rate: 20, stock_quantity: 0 });
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("page_products_title")}
        subtitle={t("page_products_subtitle")}
        action={
          <button onClick={() => setShowForm(true)} className="control flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-medium text-black">
            <Plus size={14} /> {t("add_product")}
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t("loading")}</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t("empty_state")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("product_sku")}</th>
                <th className="px-4 py-3 font-medium">{t("product_name")}</th>
                <th className="px-4 py-3 font-medium">{t("product_unit")}</th>
                <th className="px-4 py-3 font-medium">{t("product_price")}</th>
                <th className="px-4 py-3 font-medium">{t("product_tax_rate")}</th>
                <th className="px-4 py-3 font-medium">{t("product_stock")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="agent-name px-4 py-3 text-xs text-muted">{p.sku}</td>
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{p.unit}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">%{p.tax_rate}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{p.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="card w-full max-w-md overflow-hidden border border-border bg-[#0D0D0D] p-0">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="page-title text-lg text-white">{t("add_product")}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 px-6 py-5">
              <Field label={t("product_sku")} value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
              <Field label={t("product_name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label={t("product_unit")} value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
              <Field label={t("product_price")} type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) || 0 })} />
              <Field label={t("product_tax_rate")} type="number" value={String(form.tax_rate)} onChange={(v) => setForm({ ...form, tax_rate: Number(v) || 0 })} />
              <Field label={t("product_stock")} type="number" value={String(form.stock_quantity)} onChange={(v) => setForm({ ...form, stock_quantity: Number(v) || 0 })} />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setShowForm(false)} className="control border border-border px-4 py-2 text-xs text-[#CCCCCC]">{t("cancel")}</button>
              <button type="submit" disabled={saving} className="control bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-50">{saving ? t("saving") : t("save")}</button>
            </div>
          </form>
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
