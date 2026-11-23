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
    });
  } catch (error) {
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
