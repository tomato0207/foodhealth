"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登入失敗。");
        return;
      }
      router.push(data.role === "ADMIN" ? "/admin/foods" : "/today");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">登入營養管家</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          密碼
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "登入中..." : "登入"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        還沒有帳號?{" "}
        <Link href="/register" className="text-emerald-600 underline hover:text-emerald-700">
          註冊
        </Link>
      </p>
    </div>
  );
}
