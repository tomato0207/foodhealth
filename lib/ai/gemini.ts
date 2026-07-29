import { GoogleGenAI } from "@google/genai";
import { buildPrompt, extractJson, normalizeResult } from "./types";
import type { ImageInput, NutrientDescriptor, PhotoAnalysisMode, PhotoAnalysisResult } from "./types";

export async function analyzePhotoWithGemini(
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("尚未設定 GEMINI_API_KEY 環境變數,請至 Google AI Studio 申請 API Key。");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        buildPrompt(mode, nutrients),
        { inlineData: { data: image.base64, mimeType: image.mimeType } },
      ],
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });
  } catch (error) {
    throw new Error(
      `呼叫 Gemini API 失敗,請確認 GEMINI_API_KEY 正確且額度足夠。原始錯誤:${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const content = response.text;
  if (!content) {
    throw new Error("Gemini 沒有回傳任何內容。");
  }

  const parsed = extractJson(content, "Gemini");
  return normalizeResult(parsed, nutrients);
}
