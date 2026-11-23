"use client";

import { useEffect, useRef, useState } from "react";
import type { AiProviderOption, DraftItem } from "./types";

interface PhotoCaptureProps {
  mode: "food" | "label";
  onModeChange: (mode: "food" | "label") => void;
  providers: AiProviderOption[];
  defaultProvider: AiProviderOption["id"];
  onAnalyzed: (items: DraftItem[], imageId: string) => void;
}

export default function PhotoCapture({ mode, onModeChange, providers, defaultProvider, onAnalyzed }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // preselect the server default, falling back to the first backend that is actually configured
  const [provider, setProvider] = useState<AiProviderOption["id"]>(() =>
    providers.find((p) => p.id === defaultProvider && p.configured)?.id ??
    providers.find((p) => p.configured)?.id ??
    defaultProvider
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(timer);
  }, [error]);

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
      formData.append("provider", provider);
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

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">辨識引擎</span>
        {providers.length === 1 ? (
          <span className="rounded-full border border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {providers[0].label}
            {!providers[0].configured && "(尚未設定,請聯絡管理員)"}
          </span>
        ) : (
          providers.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProvider(p.id)}
            disabled={!p.configured}
            title={p.configured ? undefined : "管理員尚未設定此辨識引擎"}
            className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              provider === p.id
                ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
            }`}
          >
            {p.label}
            {!p.configured && "(未設定)"}
          </button>
          ))
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md active:scale-[0.97] active:bg-emerald-100"
        >
          📁 {file ? "重新選擇照片" : "選擇照片"}
        </button>
        {file && <span className="truncate text-sm text-gray-500">{file.name}</span>}
      </div>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="預覽" className="h-40 w-40 rounded-xl border border-gray-200 object-cover shadow-sm" />
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!file || analyzing || !providers.some((p) => p.id === provider && p.configured)}
        className="w-fit rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
      >
        {analyzing
          ? provider === "lmstudio"
            ? "AI 辨識中...(本機模型可能需要一分鐘左右)"
            : "AI 辨識中..."
          : "開始 AI 辨識"}
      </button>

      {error && (
        <div
          role="alert"
          className="animate-fade-in-up fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg shadow-black/10 sm:left-auto sm:right-4"
        >
          <span className="text-lg leading-none">⚠️</span>
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-medium text-red-600">辨識失敗</p>
            <p className="mt-0.5">{error}(照片已上傳,你可以在下方手動輸入本次紀錄)</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="關閉"
            className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
