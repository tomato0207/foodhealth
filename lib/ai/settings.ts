import { prisma } from "@/lib/db";

/** Which backend(s) photo analysis may use: a fixed one, or let each user pick per photo. */
export type AiProviderMode = "gemini" | "lmstudio" | "user_choice";

export const AI_PROVIDER_MODES: AiProviderMode[] = ["gemini", "lmstudio", "user_choice"];

export function isAiProviderMode(value: unknown): value is AiProviderMode {
  return typeof value === "string" && (AI_PROVIDER_MODES as string[]).includes(value);
}

export interface LmStudioConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AiSettings {
  mode: AiProviderMode;
  lmstudio: LmStudioConfig;
}

const SETTINGS_ID = "default";
const DEFAULT_LMSTUDIO_URL = "http://localhost:1234/v1";

/**
 * Normalizes what an admin pastes from ngrok / LM Studio into the OpenAI-compatible base URL:
 * trims spaces and trailing slashes, and appends "/v1" when it's missing.
 */
export function normalizeLmStudioBaseUrl(input: string): string {
  let url = input.trim().replace(/\/+$/, "");
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (!/\/v1$/i.test(url)) url = `${url}/v1`;
  return url;
}

/** Raw DB row (or null) — used by the admin page to show what has been saved. */
export async function getStoredAiSetting() {
  return prisma.aiSetting.findUnique({ where: { id: SETTINGS_ID } });
}

/** Effective settings: values saved by the admin override env vars. */
export async function getAiSettings(): Promise<AiSettings> {
  const row = await getStoredAiSetting();
  return {
    mode: isAiProviderMode(row?.provider) ? row.provider : "user_choice", // until an admin saves a choice, keep the old per-photo behavior
    lmstudio: {
      baseUrl: row?.lmstudioBaseUrl || process.env.LMSTUDIO_BASE_URL || DEFAULT_LMSTUDIO_URL,
      apiKey: row?.lmstudioApiKey || process.env.LMSTUDIO_API_KEY || "",
      model: row?.lmstudioModel || process.env.LMSTUDIO_MODEL || "",
    },
  };
}

export async function saveAiSetting(data: {
  provider: AiProviderMode;
  lmstudioBaseUrl: string | null;
  lmstudioModel: string | null;
  /** undefined = keep the stored key, null = clear it */
  lmstudioApiKey?: string | null;
}) {
  const { lmstudioApiKey, ...rest } = data;
  const keyUpdate = lmstudioApiKey === undefined ? {} : { lmstudioApiKey };
  await prisma.aiSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...rest, ...keyUpdate },
    update: { ...rest, ...keyUpdate },
  });
}
