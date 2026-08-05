"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Managent" style={{ height: 36, width: "auto" }} />
        </div>
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">We'll email you a link to reset it.</p>
          {sent ? (
            <p className="mt-6 text-sm text-[#22C55E]">
              If that email has an account, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#CCCCCC]">Work email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="control w-full border border-border bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-white" placeholder="you@company.com" />
              </div>
              {error ? <p className="text-sm text-[#F87171]">{error}</p> : null}
              <button disabled={loading} type="submit" className="control w-full bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50">
                {loading ? "Sending…" : "Send reset link"}
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
