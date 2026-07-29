"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "建立失敗。");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">新增使用者</h1>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          姓名
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
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
          密碼(至少 8 個字元)
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          角色
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "建立中..." : "建立使用者"}
        </button>
      </form>
    </div>
  );
}
