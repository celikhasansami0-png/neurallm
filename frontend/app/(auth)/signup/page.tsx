"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await api.register({ company_name: companyName, email, password, full_name: fullName });
      window.localStorage.setItem("neurallm_token", res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Could not create your account. Check the API URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-lg font-semibold">NeuraLLM</Link>
        <div className="card p-8">
          <h1 className="text-xl font-semibold">Create your company workspace</h1>
          <p className="mt-1 text-sm text-muted">Six default agents are seeded automatically the moment you sign up.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Company name</label>
              <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="control w-full border border-border px-3 py-2 text-sm outline-none focus:border-black" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Your name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="control w-full border border-border px-3 py-2 text-sm outline-none focus:border-black" placeholder="Sarah Chen" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Work email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="control w-full border border-border px-3 py-2 text-sm outline-none focus:border-black" placeholder="sarah@acme.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="control w-full border border-border px-3 py-2 text-sm outline-none focus:border-black" placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button disabled={loading} type="submit" className="control w-full bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Creating workspace…" : "Create workspace"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="font-medium text-foreground underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
