// Thin fetch wrapper around the FastAPI backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("quantum2_token");
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

  // Agents
  agents: () => apiFetch("/api/v1/agents"),
  createAgent: (body: {
    name: string; org_position: string; level: number; system_prompt?: string;
    allowed_tools?: string[]; reports_to?: string | null; color?: string;
  }) => apiFetch("/api/v1/agents", { method: "POST", body: JSON.stringify(body) }),
  updateAgent: (id: string, body: any) => apiFetch(`/api/v1/agents/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAgent: (id: string) => apiFetch(`/api/v1/agents/${id}`, { method: "DELETE" }),

  // Tasks
  tasks: () => apiFetch("/api/v1/tasks"),
  getTask: (id: string) => apiFetch(`/api/v1/tasks/${id}`),
  createTask: (body: { agent_id: string; title: string; description?: string }) =>
    apiFetch("/api/v1/tasks", { method: "POST", body: JSON.stringify(body) }),
  approveTask: (id: string) => apiFetch(`/api/v1/tasks/${id}/approve`, { method: "POST" }),
  rejectTask: (id: string) => apiFetch(`/api/v1/tasks/${id}/reject`, { method: "POST" }),

  // Recurring
  recurring: () => apiFetch("/api/v1/recurring"),
  createRecurring: (body: { agent_id: string; title: string; prompt?: string; cron_expression?: string; is_active?: boolean }) =>
    apiFetch("/api/v1/recurring", { method: "POST", body: JSON.stringify(body) }),
  updateRecurring: (id: string, body: any) => apiFetch(`/api/v1/recurring/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRecurring: (id: string) => apiFetch(`/api/v1/recurring/${id}`, { method: "DELETE" }),

  // Workflows
  workflows: () => apiFetch("/api/v1/workflows"),
  createWorkflow: (body: { name: string; chain: { agent_id: string; action: string }[] }) =>
    apiFetch("/api/v1/workflows", { method: "POST", body: JSON.stringify(body) }),
  runWorkflow: (id: string) => apiFetch(`/api/v1/workflows/${id}/run`, { method: "PUT" }),

  // Integrations
  integrations: () => apiFetch("/api/v1/integrations"),
  connectIntegration: (body: { tool_slug: string; display_name: string; category?: string }) =>
    apiFetch("/api/v1/integrations/connect", { method: "POST", body: JSON.stringify(body) }),
  disconnectIntegration: (id: string) => apiFetch(`/api/v1/integrations/${id}`, { method: "DELETE" }),

  // Knowledge
  knowledge: () => apiFetch("/api/v1/knowledge"),
  uploadKnowledge: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/api/v1/knowledge", { method: "POST", body: form });
  },
  deleteKnowledge: (id: string) => apiFetch(`/api/v1/knowledge/${id}`, { method: "DELETE" }),

  // Audit / ROI
  audit: () => apiFetch("/api/v1/audit"),
  replayTask: (taskId: string) => apiFetch(`/api/v1/audit/${taskId}/replay`),
  roi: () => apiFetch("/api/v1/roi"),

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
