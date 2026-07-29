"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NutrientFormProps {
  nutrientId?: string;
  initial?: {
    key: string;
    name: string;
    unit: string;
    category: string;
    defaultDailyValue: number;
    sortOrder: number;
    trackable: boolean;
  };
}

export default function NutrientForm({ nutrientId, initial }: NutrientFormProps) {
  const router = useRouter();
  const [key, setKey] = useState(initial?.key ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [defaultDailyValue, setDefaultDailyValue] = useState(initial?.defaultDailyValue ?? 0);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [trackable, setTrackable] = useState(initial?.trackable ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(nutrientId ? `/api/nutrients/${nutrientId}` : "/api/nutrients", {
        method: nutrientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, name, unit, category, defaultDailyValue, sortOrder, trackable }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "儲存失敗。");
        return;
      }
      router.push("/admin/nutrients");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        Key(僅限小寫英數與底線,建立後不可修改)
        <input
          required
          value={key}
          disabled={!!nutrientId}
          onChange={(e) => setKey(e.target.value)}
          placeholder="例如:vitamin_d"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:bg-gray-50"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        顯示名稱
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        單位
        <input
          required
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="例如:g、mg、µg、kcal"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        分類
        <input
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="例如:巨量營養素、礦物質、維生素"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        預設每日建議量
        <input
          type="number"
          step="0.1"
          value={defaultDailyValue}
          onChange={(e) => setDefaultDailyValue(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        排序(數字越小越前面)
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={trackable}
          onChange={(e) => setTrackable(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        可追蹤(顯示於使用者每日目標、AI 拍照估算、手動輸入表單)
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:col-span-2"
      >
        {saving ? "儲存中..." : "儲存"}
      </button>
    </form>
  );
}
