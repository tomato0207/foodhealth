import { getStoredAiSetting, getAiSettings } from "@/lib/ai/settings";
import AiSettingsForm from "./AiSettingsForm";
import SetupGuide from "./SetupGuide";

export default async function AdminAiSettingsPage() {
  const [stored, effective] = await Promise.all([getStoredAiSetting(), getAiSettings()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">AI 辨識設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          決定使用者拍照時用哪個 AI 辨識食物。要用別台電腦上的 LM Studio,請照下方「設定教學」把 ngrok 網址和金鑰填進來。
        </p>
      </div>

      <AiSettingsForm
        initial={{
          provider: effective.mode,
          lmstudioBaseUrl: stored?.lmstudioBaseUrl ?? process.env.LMSTUDIO_BASE_URL ?? "",
          lmstudioModel: effective.lmstudio.model,
          hasApiKey: Boolean(effective.lmstudio.apiKey),
          apiKeyFromEnv: !stored?.lmstudioApiKey && Boolean(process.env.LMSTUDIO_API_KEY),
          geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
          updatedAt: stored?.updatedAt.toISOString() ?? null,
        }}
      />

      <SetupGuide />
    </div>
  );
}
