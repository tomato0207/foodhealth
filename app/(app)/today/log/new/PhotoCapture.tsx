"use client";

import { useEffect, useRef, useState } from "react";
import type { AiProviderOption, DraftItem } from "./types";

// rough typical duration per backend; the progress bar is an estimate since the API gives no real progress
const EXPECTED_SECONDS: Record<AiProviderOption["id"], number> = { gemini: 15, lmstudio: 40 };

const MAX_UPLOAD_SIDE = 1600;

/**
 * Re-encodes the photo as a downscaled JPEG before upload: LM Studio rejects WebP, phone originals can exceed
 * Vercel's 4.5MB request limit, and smaller images are analyzed faster. Falls back to the original on failure.
 */
async function toUploadJpeg(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!analyzing) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [analyzing]);

  // eases toward 95% around the expected duration and only reaches 100% when the response arrives
  const estimatedProgress = 95 * (1 - Math.exp(-elapsedSeconds / EXPECTED_SECONDS[provider]));

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
    setElapsedSeconds(0);
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", await toUploadJpeg(file));
      formData.append("mode", mode);
      formData.append("provider", provider);
      const res = await fetch("/api/ai/analyze-photo", { method: "POST", body: formData });
      // a platform timeout returns an HTML/plain-text page, not our JSON
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(
          data?.error ??
            (res.status === 504 ? "AI 辨識逾時,請稍後再試或改用其他辨識引擎。" : "AI 辨識失敗,請改用手動輸入。")
        );
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
        {analyzing ? "AI 辨識中..." : "開始 AI 辨識"}
      </button>

      {analyzing && (
        <div className="flex max-w-sm flex-col gap-1.5" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${estimatedProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {elapsedSeconds < 3
              ? "上傳照片中..."
              : elapsedSeconds < EXPECTED_SECONDS[provider] * 2
                ? `AI 正在分析照片... 已等待 ${elapsedSeconds} 秒`
                : `比平常久一些,仍在等待回應... 已等待 ${elapsedSeconds} 秒`}
            {provider === "lmstudio" && "(本機模型)"}
          </p>
        </div>
      )}

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
