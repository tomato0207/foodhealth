"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProviderMode = "gemini" | "lmstudio" | "user_choice";

interface AiSettingsFormProps {
  initial: {
    provider: ProviderMode;
    lmstudioBaseUrl: string;
    lmstudioModel: string;
    hasApiKey: boolean;
    apiKeyFromEnv: boolean;
    geminiConfigured: boolean;
    updatedAt: string | null;
  };
}

const inputClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export default function AiSettingsForm({ initial }: AiSettingsFormProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderMode>(initial.provider);
  const [baseUrl, setBaseUrl] = useState(initial.lmstudioBaseUrl);
  const [model, setModel] = useState(initial.lmstudioModel);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [clearApiKey, setClearApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [models, setModels] = useState<string[] | null>(null);

  const options: { id: ProviderMode; title: string; desc: string; warn?: string }[] = [
    {
      id: "gemini",
      title: "Gemini(雲端)",
      desc: "所有人都用 Google Gemini 辨識。",
      warn: initial.geminiConfigured ? undefined : "伺服器尚未設定 GEMINI_API_KEY",
    },
    {
      id: "lmstudio",
      title: "LM Studio(自架模型)",
      desc: "所有人都用下方填寫的 LM Studio(例如透過 ngrok 開放的電腦)。",
    },
    {
      id: "user_choice",
      title: "讓使用者自選",
      desc: "使用者每次拍照時可以自己切換 Gemini 或 LM Studio。",
    },
  ];

  async function handleTest() {
    setTesting(true);
    setMessage(null);
    setModels(null);
    try {
      const res = await fetch("/api/ai-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lmstudioBaseUrl: baseUrl, lmstudioApiKey: apiKey, clearApiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "測試失敗。" });
        return;
      }
      setBaseUrl(data.baseUrl);
      setModels(data.models);
      setMessage({
        kind: "ok",
        text:
          data.models.length > 0
            ? `連線成功!LM Studio 目前有 ${data.models.length} 個模型,點下方名稱即可填入。`
            : "連線成功,但 LM Studio 目前沒有載入任何模型,請先在 LM Studio 載入視覺模型。",
      });
    } catch {
      setMessage({ kind: "error", text: "測試失敗,請稍後再試。" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          lmstudioBaseUrl: baseUrl,
          lmstudioModel: model,
          lmstudioApiKey: apiKey,
          clearApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "儲存失敗。" });
        return;
      }
      setBaseUrl(data.lmstudioBaseUrl);
      setApiKey("");
      setClearApiKey(false);
      setMessage({ kind: "ok", text: "已儲存,使用者下次拍照就會套用新設定。" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const usesLmStudio = provider !== "gemini";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white/90 p-5 shadow-sm backdrop-blur"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-gray-900">使用者拍照時要用哪個辨識引擎?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors ${
                provider === o.id ? "border-emerald-600 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <input
                  type="radio"
                  name="provider"
                  value={o.id}
                  checked={provider === o.id}
                  onChange={() => setProvider(o.id)}
                  className="h-4 w-4"
                />
                {o.title}
              </span>
              <span className="text-xs text-gray-500">{o.desc}</span>
              {o.warn && <span className="text-xs text-amber-700">⚠️ {o.warn}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={`flex flex-col gap-4 ${usesLmStudio ? "" : "opacity-60"}`}>
        <legend className="mb-1 flex w-full items-center justify-between text-sm font-medium text-gray-900">
          <span>LM Studio 連線資訊</span>
          <a href="#guide" className="text-xs font-normal text-emerald-600 underline hover:text-emerald-700">
            不知道去哪裡找?看設定教學 ↓
          </a>
        </legend>
        {!usesLmStudio && <p className="-mt-2 text-xs text-gray-500">目前選擇 Gemini,這些欄位不會被使用,但仍會保留。</p>}

        <label className="flex flex-col gap-1 text-sm">
          ngrok 網址(API 位址)
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://xxxx.ngrok-free.app/v1"
            className={inputClass}
          />
          <span className="text-xs text-gray-500">
            執行 <code className="font-mono">ngrok http 1234</code> 後,「Forwarding」那行的 https 網址。結尾的 /v1 可省略,會自動補上。(教學步驟 4)
          </span>
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="lmstudio-api-key">API 金鑰(密碼)</label>
          <div className="flex gap-2">
            <input
              id="lmstudio-api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (e.target.value) setClearApiKey(false);
              }}
              autoComplete="new-password"
              placeholder={
                initial.hasApiKey && !clearApiKey
                  ? "●●●●●●●●(已設定,留空表示不變更)"
                  : "LM Studio 的 API Token,未開啟驗證可留空"
              }
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="rounded-lg border border-gray-200 px-3 text-xs text-gray-600 hover:border-emerald-300"
            >
              {showKey ? "隱藏" : "顯示"}
            </button>
          </div>
          <span className="text-xs text-gray-500">
            LM Studio 開啟「Require Authentication」後建立的 API Token(不是 ngrok 的 authtoken)。(教學步驟 3)
            {initial.apiKeyFromEnv && " 目前使用的是伺服器環境變數 LMSTUDIO_API_KEY,在這裡填寫會覆蓋它。"}
          </span>
          {initial.hasApiKey && !initial.apiKeyFromEnv && (
            <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={clearApiKey}
                onChange={(e) => {
                  setClearApiKey(e.target.checked);
                  if (e.target.checked) setApiKey("");
                }}
                className="h-3.5 w-3.5"
              />
              清除已儲存的金鑰(LM Studio 已關閉驗證時使用)
            </label>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          模型名稱
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="例如:qwen2-vl-7b-instruct"
            className={inputClass}
          />
          <span className="text-xs text-gray-500">按「測試連線」後可以直接從清單點選。</span>
        </label>

        {models && models.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {models.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  model === m
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !baseUrl.trim()}
          className="w-fit rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
        >
          {testing ? "測試中..." : "🔌 測試連線"}
        </button>
      </fieldset>

      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "儲存中..." : "儲存設定"}
        </button>
        {initial.updatedAt && (
          <span className="text-xs text-gray-400">上次儲存:{new Date(initial.updatedAt).toLocaleString("zh-TW")}</span>
        )}
      </div>
    </form>
  );
}
