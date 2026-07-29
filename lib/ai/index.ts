import type { ImageInput, NutrientDescriptor, PhotoAnalysisMode, PhotoAnalysisResult } from "./types";
import { analyzePhotoWithLmStudio } from "./lmstudio";
import { analyzePhotoWithGemini } from "./gemini";

export type {
  PhotoAnalysisMode,
  NutrientDescriptor,
  AnalyzedItem,
  PhotoAnalysisResult,
  ImageInput,
} from "./types";

/** Which vision backend handles photo analysis; set via the AI_PROVIDER env var. */
export type AiProvider = "lmstudio" | "gemini";

export async function analyzePhoto(
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  const provider = (process.env.AI_PROVIDER ?? "lmstudio").trim().toLowerCase();

  switch (provider) {
    case "gemini":
      return analyzePhotoWithGemini(mode, image, nutrients);
    case "lmstudio":
      return analyzePhotoWithLmStudio(mode, image, nutrients);
    default:
      throw new Error(`未知的 AI_PROVIDER:「${provider}」,請在 .env 設為 "lmstudio" 或 "gemini"。`);
  }
}
