"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserRowProps {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}

export default function UserRow({ id, email, name, role, active, isSelf }: UserRowProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "更新失敗。");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-emerald-100">
      <td className="py-2">{name}</td>
      <td className="py-2 text-gray-500">{email}</td>
      <td className="py-2">
        <select
          value={role}
          disabled={isSelf || saving}
          onChange={(e) => patch({ role: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td className="py-2">
        <button
          onClick={() => patch({ active: !active })}
          disabled={isSelf || saving}
          className={`rounded px-2 py-1 text-xs disabled:opacity-60 ${
            active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {active ? "啟用中" : "已停用"}
        </button>
      </td>
      <td className="py-2 text-xs text-red-600">{error}</td>
    </tr>
  );
}
