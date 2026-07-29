"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NutrientDescriptor {
  id: string;
  key: string;
  name: string;
  unit: string;
  category: string;
}

interface FoodFormProps {
  nutrients: NutrientDescriptor[];
  foodId?: string;
  initial?: {
    name: string;
    servingSize: number;
    servingUnit: string;
    category: string;
    note: string;
    nutrientAmounts: Record<string, number>;
  };
}

export default function FoodForm({ nutrients, foodId, initial }: FoodFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [servingSize, setServingSize] = useState(initial?.servingSize ?? 100);
  const [servingUnit, setServingUnit] = useState(initial?.servingUnit ?? "克");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [amounts, setAmounts] = useState<Record<string, number>>(initial?.nutrientAmounts ?? {});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(foodId ? `/api/foods/${foodId}` : "/api/foods", {
        method: foodId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          servingSize,
          servingUnit,
          category,
          note,
          nutrientAmounts: amounts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "儲存失敗。");
        return;
      }
      router.push("/admin/foods");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          食物名稱
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          分類
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如:主食、肉類、蔬菜"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          份量數值
          <input
            type="number"
            step="0.1"
            required
            value={servingSize}
            onChange={(e) => setServingSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          份量單位
          <input
            required
            value={servingUnit}
            onChange={(e) => setServingUnit(e.target.value)}
            placeholder="例如:克(約1碗)"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        備註
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>

      <div>
        <h3 className="mb-2 text-sm font-medium">每份營養素含量</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {nutrients.map((n) => (
            <label key={n.id} className="flex flex-col gap-0.5 text-xs text-gray-500">
              {n.name}({n.unit})
              <input
                type="number"
                step="0.01"
                value={amounts[n.key] ?? 0}
                onChange={(e) => setAmounts((prev) => ({ ...prev, [n.key]: Number(e.target.value) }))}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? "儲存中..." : "儲存"}
      </button>
    </form>
  );
}
