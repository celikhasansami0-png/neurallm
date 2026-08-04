"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing its token. Request a new one.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-32.png" alt="Quantum²" width={32} height={32} className="rounded-full" />
          <span className="page-title text-2xl text-white">Quantum²</span>
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-white">Set a new password</h1>
          <p className="mt-1 text-sm text-muted">Choose a strong password for your account.</p>
          {done ? (
            <p className="mt-6 text-sm text-[#22C55E]">Password updated. Redirecting you to log in…</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#CCCCCC]">New password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white" placeholder="••••••••" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#CCCCCC]">Confirm password</label>
                <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white" placeholder="••••••••" />
              </div>
              {error ? <p className="text-sm text-[#F87171]">{error}</p> : null}
              <button disabled={loading} type="submit" className="control w-full bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-white underline">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
