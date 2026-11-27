"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NUTRIENT_ICONS } from "@/lib/types";

interface TargetRow {
  nutrientId: string;
  key: string;
  name: string;
  unit: string;
  category: string;
  dailyTarget: number;
  overridden: boolean;
  /** shown value is a live preview from unsaved profile edits */
  unsaved: boolean;
}

function TargetRowItem({ row }: { row: TargetRow }) {
  const router = useRouter();
  const [value, setValue] = useState(row.dailyTarget);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/profile/targets/${row.nutrientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyTarget: value }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await fetch(`/api/profile/targets/${row.nutrientId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-black/5 last:border-0">
      <td className="py-2.5 pr-3">
        <span className="mr-1.5" aria-hidden>
          {NUTRIENT_ICONS[row.key] ?? "•"}
        </span>
        {row.name}
        {row.overridden && (
          <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
            已覆寫
          </span>
        )}
        {row.unsaved && (
          <span className="ml-2 rounded-full bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800">
            預覽
          </span>
        )}
      </td>
      <td className="py-2 pr-3">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <span className="ml-1 text-gray-400">{row.unit}</span>
      </td>
      <td className="py-2 flex gap-2">
        <button onClick={handleSave} disabled={saving} className="text-emerald-600 underline hover:text-emerald-700">
          儲存
        </button>
        {row.overridden && (
          <button onClick={handleReset} disabled={saving} className="text-gray-400 underline hover:text-gray-600">
            重設
          </button>
        )}
      </td>
    </tr>
  );
}

export default function TargetsTable({ rows }: { rows: TargetRow[] }) {
  const categories = Array.from(new Set(rows.map((r) => r.category)));

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{category}</h3>
          <table className="w-full text-sm">
            <tbody>
              {rows
                .filter((r) => r.category === category)
                .map((row) => (
                  // keyed on the value too: the input keeps its own draft state, so it must
                  // restart whenever the profile preview (or a save) changes the target
                  <TargetRowItem key={`${row.nutrientId}:${row.dailyTarget}`} row={row} />
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
