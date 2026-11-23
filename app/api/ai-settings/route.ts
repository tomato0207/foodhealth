import { requireAdmin, AuthError } from "@/lib/auth";
import { isAiProviderMode, normalizeLmStudioBaseUrl, saveAiSetting } from "@/lib/ai/settings";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const provider = body?.provider;
  const baseUrl = typeof body?.lmstudioBaseUrl === "string" ? normalizeLmStudioBaseUrl(body.lmstudioBaseUrl) : "";
  const model = typeof body?.lmstudioModel === "string" ? body.lmstudioModel.trim() : "";
  const apiKeyInput = typeof body?.lmstudioApiKey === "string" ? body.lmstudioApiKey.trim() : "";
  const clearApiKey = body?.clearApiKey === true;

  if (!isAiProviderMode(provider)) {
    return Response.json({ error: "請選擇辨識引擎。" }, { status: 400 });
  }
  if (baseUrl) {
    try {
      new URL(baseUrl);
    } catch {
      return Response.json({ error: "LM Studio 網址格式不正確,應類似 https://xxxx.ngrok-free.app/v1。" }, { status: 400 });
    }
  }
  if (provider === "lmstudio" && (!baseUrl || !model)) {
    return Response.json({ error: "選擇 LM Studio 時,必須填寫 ngrok 網址與模型名稱。" }, { status: 400 });
  }

  await saveAiSetting({
    provider,
    lmstudioBaseUrl: baseUrl || null,
    lmstudioModel: model || null,
    // blank field = keep the saved key, so admins don't have to retype it on every save
    lmstudioApiKey: clearApiKey ? null : apiKeyInput ? apiKeyInput : undefined,
  });

  return Response.json({ ok: true, lmstudioBaseUrl: baseUrl });
}
