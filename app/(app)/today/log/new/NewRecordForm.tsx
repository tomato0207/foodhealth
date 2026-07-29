"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MEAL_TYPE_LABELS, type MealType, type RecordSource } from "@/lib/types";
import type { DraftItem, NutrientDescriptor } from "./types";
import PhotoCapture from "./PhotoCapture";
import FoodPicker from "./FoodPicker";
import ItemsEditor from "./ItemsEditor";

type EntryMode = "select" | "photo" | "manual";

export default function NewRecordForm({
  nutrients,
  defaultDate,
}: {
  nutrients: NutrientDescriptor[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [entryMode, setEntryMode] = useState<EntryMode>("select");
  const [photoMode, setPhotoMode] = useState<"food" | "label">("food");
  const [mealDate, setMealDate] = useState(defaultDate);
  const [mealType, setMealType] = useState<MealType>("LUNCH");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [imageId, setImageId] = useState<string | null>(null);
  const [source, setSource] = useState<RecordSource>("MANUAL");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleAnalyzed(newItems: DraftItem[], analyzedImageId: string) {
    setItems((prev) => [...prev, ...newItems]);
    setImageId(analyzedImageId);
    setSource(photoMode === "food" ? "AI_FOOD_PHOTO" : "AI_LABEL_PHOTO");
  }

  function handleAddManual(item: DraftItem) {
    setItems((prev) => [...prev, item]);
  }

  async function handleSubmit() {
    setError(null);
    if (items.length === 0) {
      setError("請至少新增一項食物。");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealDate,
          mealType,
          source,
          imageId: imageId ?? undefined,
          items: items.map((item) => ({
            foodId: item.foodId ?? undefined,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            nutrients: item.nutrients,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "儲存失敗。");
        return;
      }
      router.push("/today");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm shadow-black/[0.03] backdrop-blur">
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm">
          日期
          <input
            type="date"
            value={mealDate}
            onChange={(e) => setMealDate(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          餐別
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {entryMode === "select" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setEntryMode("photo")}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl transition-transform group-hover:scale-110">
              📷
            </span>
            <div>
              <div className="font-medium text-gray-900">拍照辨識</div>
              <div className="mt-0.5 text-sm text-gray-500">拍食物照片或營養標示,讓 AI 估算</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("manual")}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-xl transition-transform group-hover:scale-110">
              ✍️
            </span>
            <div>
              <div className="font-medium text-gray-900">手動輸入</div>
              <div className="mt-0.5 text-sm text-gray-500">從食物資料庫搜尋或自訂輸入</div>
            </div>
          </button>
        </div>
      )}

      {entryMode === "photo" && (
        <PhotoCapture mode={photoMode} onModeChange={setPhotoMode} onAnalyzed={handleAnalyzed} />
      )}

      {entryMode === "manual" && <FoodPicker onAdd={handleAddManual} />}

      {entryMode !== "select" && (
        <button
          type="button"
          onClick={() => setEntryMode(entryMode === "photo" ? "manual" : "photo")}
          className="w-fit text-sm text-emerald-600 underline hover:text-emerald-700"
        >
          {entryMode === "photo" ? "改用手動輸入補充其他品項" : "改用拍照辨識補充其他品項"}
        </button>
      )}

      {items.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-medium">本次紀錄的品項(儲存前可再次確認/修改)</h2>
          <ItemsEditor items={items} nutrients={nutrients} onChange={setItems} />
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || items.length === 0}
        className="w-fit rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? "儲存中..." : "儲存這筆紀錄"}
      </button>
    </div>
  );
}
