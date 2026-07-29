"use client";

import { useState } from "react";
import type { DraftItem } from "./types";

interface PhotoCaptureProps {
  mode: "food" | "label";
  onModeChange: (mode: "food" | "label") => void;
  onAnalyzed: (items: DraftItem[], imageId: string) => void;
}

export default function PhotoCapture({ mode, onModeChange, onAnalyzed }: PhotoCaptureProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      const res = await fetch("/api/ai/analyze-photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI 辨識失敗,請改用手動輸入。");
        return;
      }
      const items: DraftItem[] = (data.items as {
        name: string;
        quantity: number;
        unit: string;
        nutrients: Record<string, number>;
      }[]).map((item) => ({
        clientId: crypto.randomUUID(),
        itemName: item.name,
        foodId: null,
        quantity: item.quantity,
        unit: item.unit,
        nutrients: item.nutrients,
        perServingNutrients: null,
        estimatedByAI: true,
      }));
      onAnalyzed(items, data.imageId);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => onModeChange("food")}
          className={`rounded-lg border px-3 py-1.5 transition-colors ${
            mode === "food" ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
          }`}
        >
          🍱 拍食物照片
        </button>
        <button
          type="button"
          onClick={() => onModeChange("label")}
          className={`rounded-lg border px-3 py-1.5 transition-colors ${
            mode === "label" ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
          }`}
        >
          🏷️ 拍營養標示
        </button>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="text-sm"
      />

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="預覽" className="h-40 w-40 rounded-xl border border-gray-200 object-cover shadow-sm" />
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!file || analyzing}
        className="w-fit rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {analyzing ? "AI 辨識中..." : "開始 AI 辨識"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error} (照片已上傳,你可以在下方手動輸入本次紀錄)
        </p>
      )}
    </div>
  );
}
