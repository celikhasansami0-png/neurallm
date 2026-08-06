"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n, LANGUAGES } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await api.login({ email, password });
      window.localStorage.setItem("phratic_token", res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(t("invalid_credentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={dir}>
      <div className="absolute right-4 top-4">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="control border border-border bg-[#0A0A0A] px-2 py-1.5 text-xs text-white outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Phratic" style={{ height: 36, width: "auto" }} />
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-white">{t("log_in")}</h1>
          <p className="mt-1 text-sm text-muted">{t("login_tagline")}</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#CCCCCC]">{t("work_email")}</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white" placeholder="you@company.com" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1 block text-sm font-medium text-[#CCCCCC]">{t("password")}</label>
                <Link href="/forgot-password" className="text-xs text-muted underline hover:text-white">{t("forgot_password")}</Link>
              </div>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white" placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-[#F87171]">{error}</p> : null}
            <button disabled={loading} type="submit" className="control w-full bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50">
              {loading ? t("logging_in") : t("log_in")}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          New to Phratic? <Link href="/signup" className="font-medium text-white underline">Create a workspace</Link>
        </p>
      </div>
    </div>
  );
}
