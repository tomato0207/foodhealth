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

/** Which vision backend handles photo analysis; the user picks one per photo, AI_PROVIDER sets the default. */
export type AiProvider = "lmstudio" | "gemini";

export const AI_PROVIDERS: AiProvider[] = ["gemini", "lmstudio"];

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: "Gemini(雲端)",
  lmstudio: "LM Studio(本機模型)",
};

export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === "string" && (AI_PROVIDERS as string[]).includes(value);
}

/** The provider preselected in the UI and used when a request doesn't specify one. */
export function getDefaultProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? "lmstudio").trim().toLowerCase();
  return isAiProvider(provider) ? provider : "lmstudio";
}

/** Whether the env vars a provider needs are set — unconfigured ones are shown disabled in the UI. */
export function isProviderConfigured(provider: AiProvider): boolean {
  switch (provider) {
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "lmstudio":
      return Boolean(process.env.LMSTUDIO_MODEL);
  }
}

export async function analyzePhoto(
  provider: AiProvider,
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  switch (provider) {
    case "gemini":
      return analyzePhotoWithGemini(mode, image, nutrients);
    case "lmstudio":
      return analyzePhotoWithLmStudio(mode, image, nutrients);
  }
}
