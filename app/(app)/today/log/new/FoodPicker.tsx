"use client";

import { useState } from "react";
import type { DraftItem } from "./types";

interface FoodSearchResult {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  category: string;
  nutrients: Record<string, number>;
}

export default function FoodPicker({ onAdd }: { onAdd: (item: DraftItem) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [customName, setCustomName] = useState("");

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      setResults(data.foods ?? []);
    } finally {
      setSearching(false);
    }
  }

  function addFood(food: FoodSearchResult) {
    onAdd({
      clientId: crypto.randomUUID(),
      itemName: food.name,
      foodId: food.id,
      quantity: 1,
      unit: food.servingUnit,
      nutrients: { ...food.nutrients },
      perServingNutrients: { ...food.nutrients },
      estimatedByAI: false,
    });
    setQuery("");
    setResults([]);
  }

  function addCustom() {
    if (!customName.trim()) return;
    onAdd({
      clientId: crypto.randomUUID(),
      itemName: customName.trim(),
      foodId: null,
      quantity: 1,
      unit: "份",
      nutrients: {},
      perServingNutrients: null,
      estimatedByAI: false,
    });
    setCustomName("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="flex flex-col gap-1 text-sm">
          搜尋食物資料庫
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="例如:白飯"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        {searching && <p className="mt-1 text-xs text-black/50">搜尋中...</p>}
        {results.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => addFood(food)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {food.name}{" "}
                  <span className="text-gray-400">
                    ({food.servingSize}{food.servingUnit} · {food.category})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          找不到食物?新增自訂項目
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="輸入食物名稱"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <button
          type="button"
          onClick={addCustom}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          加入
        </button>
      </div>
    </div>
  );
}
