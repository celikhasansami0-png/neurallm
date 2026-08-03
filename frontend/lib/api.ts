// Thin fetch wrapper around the FastAPI backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("neurallm_token");
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  register: (body: { company_name: string; email: string; password: string; full_name?: string }) =>
    apiFetch("/api/v1/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/api/v1/auth/me"),
  agents: () => apiFetch("/api/v1/agents"),
  tasks: () => apiFetch("/api/v1/tasks"),
  approveTask: (id: string) => apiFetch(`/api/v1/tasks/${id}/approve`, { method: "POST" }),
  rejectTask: (id: string) => apiFetch(`/api/v1/tasks/${id}/reject`, { method: "POST" }),
  recurring: () => apiFetch("/api/v1/recurring"),
  workflows: () => apiFetch("/api/v1/workflows"),
  integrations: () => apiFetch("/api/v1/integrations"),
  knowledge: () => apiFetch("/api/v1/knowledge"),
  audit: () => apiFetch("/api/v1/audit"),
  roi: () => apiFetch("/api/v1/roi"),
};

export { API_URL };
