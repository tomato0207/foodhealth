import OpenAI from "openai";
import { buildPrompt, extractJson, normalizeResult } from "./types";
import type { ImageInput, NutrientDescriptor, PhotoAnalysisMode, PhotoAnalysisResult } from "./types";
import type { LmStudioConfig } from "./settings";

export function createLmStudioClient(config: Pick<LmStudioConfig, "baseUrl" | "apiKey">) {
  return new OpenAI({
    baseURL: config.baseUrl,
    // only checked when "Require Authentication" is on in LM Studio; the SDK just requires some value otherwise
    apiKey: config.apiKey || "lm-studio",
    // lets requests through when LM Studio is exposed via an ngrok tunnel (skips ngrok's browser warning page)
    defaultHeaders: { "ngrok-skip-browser-warning": "true" },
    // give up before Vercel kills the function at 300s, so the user gets a real error instead of a hang;
    // no retries — a retried slow local model would only blow past that limit
    timeout: 240_000,
    maxRetries: 0,
  });
}

export async function analyzePhotoWithLmStudio(
  config: LmStudioConfig,
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  const client = createLmStudioClient(config);
  const model = config.model;
  if (!model) {
    throw new Error("尚未設定 LM Studio 模型名稱,請管理員到「AI 辨識設定」填入 LM Studio 中已載入的視覺模型。");
  }

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(mode, nutrients) },
            { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } },
          ],
        },
      ],
      temperature: 0.2,
      // skip "thinking" on reasoning models (e.g. Qwen3.5): ~10x faster in testing (46s → 5s); ignored by other models
      reasoning_effort: "none",
    });
  } catch (error) {
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new Error("LM Studio 回應逾時(超過 4 分鐘),請確認那台電腦的 LM Studio 沒有卡住,或改用 Gemini。");
    }
    throw new Error(
      `無法連線到 LM Studio(${config.baseUrl})。請確認 LM Studio 已啟動伺服器、ngrok 仍在執行並載入視覺模型,或請管理員檢查「AI 辨識設定」。原始錯誤:${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LM Studio 沒有回傳任何內容。");
  }

  const parsed = extractJson(content, "LM Studio");
  return normalizeResult(parsed, nutrients);
}
