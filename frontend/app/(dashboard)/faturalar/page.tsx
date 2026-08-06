"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function DocumentsPage() {
  const { t } = useI18n();
  const [documents, setDocuments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [generating, setGenerating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [d, o] = await Promise.all([api.documents(), api.orders()]);
      setDocuments(d || []);
      setOrders(o || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const orderNumberById = Object.fromEntries(orders.map((o) => [o.id, o.order_number]));

  async function generate(docType: "irsaliye" | "fatura") {
    if (!selectedOrder) return;
    setGenerating(true);
    try {
      await api.createDocument({ order_id: selectedOrder, doc_type: docType });
      load();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader title={t("page_invoices_title")} subtitle={t("page_invoices_subtitle")} />

      <div className="card mb-6 p-5">
        <div className="mb-3 text-sm font-semibold text-white">{t("generate_document")}</div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} className="control border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none">
            <option value="">{t("order_number")}</option>
            {orders.map((o) => <option key={o.id} value={o.id}>{o.order_number}</option>)}
          </select>
          <button disabled={!selectedOrder || generating} onClick={() => generate("irsaliye")} className="control border border-border px-3 py-2 text-xs font-medium text-[#CCCCCC] disabled:opacity-50">
            {t("doc_irsaliye")}
          </button>
          <button disabled={!selectedOrder || generating} onClick={() => generate("fatura")} className="control bg-white px-3 py-2 text-xs font-medium text-black disabled:opacity-50">
            {t("doc_fatura")}
          </button>
        </div>
      </div>

      <div className="mb-3 text-sm font-semibold text-white">{t("document_history")}</div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t("loading")}</div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t("empty_state")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("doc_number")}</th>
                <th className="px-4 py-3 font-medium">{t("doc_type")}</th>
                <th className="px-4 py-3 font-medium">{t("order_number")}</th>
                <th className="px-4 py-3 font-medium">{t("date")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((d) => (
                <tr key={d.id}>
                  <td className="agent-name px-4 py-3 text-xs text-white">{d.doc_number}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">
                    <span className="inline-flex items-center gap-1"><FileText size={12} /> {d.doc_type === "irsaliye" ? t("doc_irsaliye") : t("doc_fatura")}</span>
                  </td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{orderNumberById[d.order_id] || "—"}</td>
                  <td className="px-4 py-3 text-[#CCCCCC]">{new Date(d.issued_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <a href={api.documentPdfUrl(d.id)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted hover:text-white">
                      <Download size={12} /> {t("download_pdf")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
