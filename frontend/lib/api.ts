// Thin fetch wrapper around the FastAPI backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("phratic_token");
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return (undefined as unknown) as T;
}

export const api = {
  // Auth
  register: (body: { company_name: string; email: string; password: string; full_name?: string }) =>
    apiFetch("/api/v1/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/api/v1/auth/me"),
  verifyEmail: (token: string) => apiFetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`),
  requestPasswordReset: (email: string) =>
    apiFetch("/api/v1/auth/request-password-reset", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, new_password: string) =>
    apiFetch("/api/v1/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) }),

  // Cariler (customers & suppliers)
  cariler: (type?: "customer" | "supplier") => apiFetch(`/api/v1/cariler${type ? `?type=${type}` : ""}`),
  createCari: (body: any) => apiFetch("/api/v1/cariler", { method: "POST", body: JSON.stringify(body) }),
  updateCari: (id: string, body: any) => apiFetch(`/api/v1/cariler/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCari: (id: string) => apiFetch(`/api/v1/cariler/${id}`, { method: "DELETE" }),
  cariStatement: (id: string) => apiFetch(`/api/v1/cariler/${id}/statement`),

  // Products
  products: () => apiFetch("/api/v1/products"),
  createProduct: (body: any) => apiFetch("/api/v1/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => apiFetch(`/api/v1/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: string) => apiFetch(`/api/v1/products/${id}`, { method: "DELETE" }),

  // Orders (Sipariş / Proforma)
  orders: (params?: { status?: string; cari_id?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/api/v1/orders${qs ? `?${qs}` : ""}`);
  },
  getOrder: (id: string) => apiFetch(`/api/v1/orders/${id}`),
  createOrder: (body: any) => apiFetch("/api/v1/orders", { method: "POST", body: JSON.stringify(body) }),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch(`/api/v1/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  deleteOrder: (id: string) => apiFetch(`/api/v1/orders/${id}`, { method: "DELETE" }),

  // Shipments (Sevkiyat)
  shipments: (status?: string) => apiFetch(`/api/v1/shipments${status ? `?status=${status}` : ""}`),
  createShipment: (body: any) => apiFetch("/api/v1/shipments", { method: "POST", body: JSON.stringify(body) }),
  updateShipmentStatus: (id: string, status: string) =>
    apiFetch(`/api/v1/shipments/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  deleteShipment: (id: string) => apiFetch(`/api/v1/shipments/${id}`, { method: "DELETE" }),

  // Documents (İrsaliye / Fatura)
  documents: (params?: { order_id?: string; doc_type?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/api/v1/documents${qs ? `?${qs}` : ""}`);
  },
  createDocument: (body: { order_id: string; doc_type: "irsaliye" | "fatura" }) =>
    apiFetch("/api/v1/documents", { method: "POST", body: JSON.stringify(body) }),
  documentPdfUrl: (id: string) => `${API_URL}/api/v1/documents/${id}/pdf`,

  // Payments
  payments: (status?: string) => apiFetch(`/api/v1/documents/payments/list${status ? `?status=${status}` : ""}`),
  createPayment: (body: any) => apiFetch("/api/v1/documents/payments", { method: "POST", body: JSON.stringify(body) }),
  markPaymentPaid: (id: string) => apiFetch(`/api/v1/documents/payments/${id}/mark-paid`, { method: "PUT" }),

  // Reports
  reportSalesByCustomer: () => apiFetch("/api/v1/reports/sales-by-customer"),
  reportPaymentStatus: () => apiFetch("/api/v1/reports/payment-status"),
  reportShipments: () => apiFetch("/api/v1/reports/shipments"),
  reportOutstanding: () => apiFetch("/api/v1/reports/outstanding"),

  // Integrations
  integrations: () => apiFetch("/api/v1/integrations"),
  connectIntegration: (body: { tool_slug: string; display_name: string; category?: string }) =>
    apiFetch("/api/v1/integrations/connect", { method: "POST", body: JSON.stringify(body) }),
  disconnectIntegration: (id: string) => apiFetch(`/api/v1/integrations/${id}`, { method: "DELETE" }),

  // Webhooks
  getWebhookConfig: () => apiFetch("/api/v1/webhooks/config"),
  setWebhookConfig: (webhook_url: string) =>
    apiFetch("/api/v1/webhooks/config", { method: "PUT", body: JSON.stringify({ webhook_url }) }),
  testWebhook: (url?: string) => apiFetch("/api/v1/webhooks/test", { method: "POST", body: JSON.stringify({ url }) }),

  // Billing
  billingStatus: () => apiFetch("/api/v1/billing/status"),
  createCheckoutSession: (plan: "team" | "business") =>
    apiFetch("/api/v1/billing/create-checkout-session", { method: "POST", body: JSON.stringify({ plan }) }),
};

export { API_URL };
