"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function ReportsPage() {
  const { t, formatMoney } = useI18n();
  const [salesByCustomer, setSalesByCustomer] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.reportSalesByCustomer().catch(() => []),
      api.reportPaymentStatus().catch(() => []),
      api.reportShipments().catch(() => []),
      api.reportOutstanding().catch(() => []),
    ]).then(([s, p, sh, o]) => {
      setSalesByCustomer(s || []);
      setPaymentStatus(p || []);
      setShipments(sh || []);
      setOutstanding(o || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted">{t("loading")}</div>;
  }

  return (
    <div>
      <PageHeader title={t("page_reports_title")} subtitle={t("page_reports_subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 text-sm font-semibold text-white">{t("report_sales_by_customer")}</div>
          {salesByCustomer.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted">{t("empty_state")}</div>
          ) : (
            <div className="divide-y divide-border">
              {salesByCustomer.map((r) => (
                <div key={r.cari_id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#CCCCCC]">{r.cari_name}</span>
                  <span className="text-white">{formatMoney(r.total)} <span className="text-xs text-muted">({r.order_count})</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 text-sm font-semibold text-white">{t("report_payment_status")}</div>
          {paymentStatus.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted">{t("empty_state")}</div>
          ) : (
            <div className="divide-y divide-border">
              {paymentStatus.map((r) => (
                <div key={r.status} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#CCCCCC]">{t(`payment_status_${r.status}`)}</span>
                  <span className="text-white">{formatMoney(r.total)} <span className="text-xs text-muted">({r.count})</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 text-sm font-semibold text-white">{t("report_shipments")}</div>
          {shipments.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted">{t("empty_state")}</div>
          ) : (
            <div className="divide-y divide-border">
              {shipments.map((r) => (
                <div key={r.status} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#CCCCCC]">{t(`shipment_status_${r.status}`)}</span>
                  <span className="text-white">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 text-sm font-semibold text-white">{t("report_outstanding")}</div>
          {outstanding.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted">{t("empty_state")}</div>
          ) : (
            <div className="divide-y divide-border">
              {outstanding.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#F87171]">{formatMoney(r.amount)}</span>
                  <span className="text-xs text-muted">{r.days_overdue} gün gecikme</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
