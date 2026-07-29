"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MEAL_TYPE_ICONS, MEAL_TYPE_LABELS, type MealType } from "@/lib/types";

interface RecordCardProps {
  id: string;
  mealType: MealType;
  imageId: string | null;
  items: { id: string; itemName: string; quantity: number; unit: string; estimatedByAI: boolean }[];
  createdAt: string;
}

export default function RecordCard({ id, mealType, imageId, items, createdAt }: RecordCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("確定要刪除這筆紀錄嗎?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/records/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      {imageId && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/uploads/${imageId}`}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {MEAL_TYPE_ICONS[mealType]} {MEAL_TYPE_LABELS[mealType]}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <ul className="mt-1 text-sm text-gray-600">
          {items.map((item) => (
            <li key={item.id}>
              {item.itemName} × {item.quantity} {item.unit}
              {item.estimatedByAI && <span className="ml-1 text-xs text-emerald-600">(AI 估算)</span>}
            </li>
          ))}
        </ul>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-2 text-xs text-red-600 underline disabled:opacity-50"
        >
          刪除
        </button>
      </div>
    </div>
  );
}
