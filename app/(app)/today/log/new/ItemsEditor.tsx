"use client";

import type { DraftItem, NutrientDescriptor } from "./types";

interface ItemsEditorProps {
  items: DraftItem[];
  nutrients: NutrientDescriptor[];
  onChange: (items: DraftItem[]) => void;
}

function scale(perServing: Record<string, number>, quantity: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(perServing)) {
    result[key] = value * quantity;
  }
  return result;
}

export default function ItemsEditor({ items, nutrients, onChange }: ItemsEditorProps) {
  function updateItem(clientId: string, patch: Partial<DraftItem>) {
    onChange(
      items.map((item) => {
        if (item.clientId !== clientId) return item;
        const next = { ...item, ...patch };
        if (next.perServingNutrients && patch.quantity !== undefined) {
          next.nutrients = scale(next.perServingNutrients, next.quantity);
        }
        return next;
      })
    );
  }

  function updateNutrient(clientId: string, key: string, value: number) {
    onChange(
      items.map((item) =>
        item.clientId === clientId ? { ...item, nutrients: { ...item.nutrients, [key]: value } } : item
      )
    );
  }

  function removeItem(clientId: string) {
    onChange(items.filter((item) => item.clientId !== clientId));
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">尚未新增任何品項。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const readOnlyNutrients = item.perServingNutrients !== null;
        return (
          <div key={item.clientId} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={item.itemName}
                onChange={(e) => updateItem(item.clientId, { itemName: e.target.value })}
                disabled={item.foodId !== null}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50 disabled:opacity-70"
              />
              <input
                type="number"
                step="0.1"
                value={item.quantity}
                onChange={(e) => updateItem(item.clientId, { quantity: Number(e.target.value) })}
                className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                value={item.unit}
                onChange={(e) => updateItem(item.clientId, { unit: e.target.value })}
                className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {item.estimatedByAI && <span className="text-xs text-emerald-600">AI 估算</span>}
              <button
                type="button"
                onClick={() => removeItem(item.clientId)}
                className="text-xs text-red-600 underline"
              >
                移除
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {nutrients.map((n) => (
                <label key={n.key} className="flex flex-col gap-0.5 text-xs text-gray-500">
                  {n.name}({n.unit})
                  <input
                    type="number"
                    step="0.1"
                    value={item.nutrients[n.key] ?? 0}
                    disabled={readOnlyNutrients}
                    onChange={(e) => updateNutrient(item.clientId, n.key, Number(e.target.value))}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
