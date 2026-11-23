import type { ImageInput, NutrientDescriptor, PhotoAnalysisMode, PhotoAnalysisResult } from "./types";
import { analyzePhotoWithLmStudio } from "./lmstudio";
import { analyzePhotoWithGemini } from "./gemini";
import type { AiSettings } from "./settings";

export type {
  PhotoAnalysisMode,
  NutrientDescriptor,
  AnalyzedItem,
  PhotoAnalysisResult,
  ImageInput,
} from "./types";
export { getAiSettings, type AiSettings, type AiProviderMode } from "./settings";

/** Which vision backend handles photo analysis; the admin fixes one or lets users pick per photo. */
export type AiProvider = "lmstudio" | "gemini";

export const AI_PROVIDERS: AiProvider[] = ["gemini", "lmstudio"];

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: "Gemini(雲端)",
  lmstudio: "LM Studio(本機模型)",
};

export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === "string" && (AI_PROVIDERS as string[]).includes(value);
}

/** The env-level default, used to preselect a backend when users may choose. */
export function getDefaultProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? "lmstudio").trim().toLowerCase();
  return isAiProvider(provider) ? provider : "lmstudio";
}

/** Backends users are allowed to use under the current settings. */
export function getAllowedProviders(settings: AiSettings): AiProvider[] {
  return settings.mode === "user_choice" ? AI_PROVIDERS : [settings.mode];
}

/** Whether a provider has what it needs — unconfigured ones are shown disabled in the UI. */
export function isProviderConfigured(provider: AiProvider, settings: AiSettings): boolean {
  switch (provider) {
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "lmstudio":
      return Boolean(settings.lmstudio.model);
  }
}

export async function analyzePhoto(
  provider: AiProvider,
  settings: AiSettings,
  mode: PhotoAnalysisMode,
  image: ImageInput,
  nutrients: NutrientDescriptor[]
): Promise<PhotoAnalysisResult> {
  switch (provider) {
    case "gemini":
      return analyzePhotoWithGemini(mode, image, nutrients);
    case "lmstudio":
      return analyzePhotoWithLmStudio(settings.lmstudio, mode, image, nutrients);
  }
}
