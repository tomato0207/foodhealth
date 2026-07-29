"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, confirmText }: { endpoint: string; confirmText: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(confirmText)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "刪除失敗。");
        return;
      }
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <span>
      <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 underline disabled:opacity-50">
        刪除
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </span>
  );
}
