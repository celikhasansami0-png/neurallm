"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    api
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res?.message || "Email verified successfully.");
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "This verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Managent" style={{ height: 36, width: "auto" }} />
        </div>
        <div className="card p-8 text-center">
          <h1 className="text-xl font-semibold text-white">Email verification</h1>
          {status === "loading" ? <p className="mt-4 text-sm text-muted">Verifying your email…</p> : null}
          {status === "success" ? <p className="mt-4 text-sm text-[#22C55E]">{message}</p> : null}
          {status === "error" ? <p className="mt-4 text-sm text-[#F87171]">{message}</p> : null}
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-white underline">Go to log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
