import OpenAI from "openai";
import { buildPrompt, extractJson, normalizeResult } from "./types";
import type { ImageInput, NutrientDescriptor, PhotoAnalysisMode, PhotoAnalysisResult } from "./types";

function getClient() {
  return new OpenAI({
    baseURL: process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
    apiKey: "lm-studio", // LM Studio does not validate this, the SDK just requires a value
  });
}

export async function analyzePhotoWithLmStudio(
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  const client = getClient();
  const model = process.env.LMSTUDIO_MODEL;
  if (!model) {
    throw new Error("尚未設定 LMSTUDIO_MODEL 環境變數,請指定 LM Studio 中已載入的視覺模型名稱。");
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
      `無法連線到 LM Studio(${process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1"})。請確認 LM Studio 已啟動本機伺服器並載入視覺模型。原始錯誤:${
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
