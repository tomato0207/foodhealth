export type PhotoAnalysisMode = "food" | "label";

export interface NutrientDescriptor {
  key: string;
  name: string;
  unit: string;
}

export interface AnalyzedItem {
  name: string;
  quantity: number;
  unit: string;
  nutrients: Record<string, number>;
}

export interface PhotoAnalysisResult {
  items: AnalyzedItem[];
}

export interface ImageInput {
  /** raw base64 (no "data:...;base64," prefix) */
  base64: string;
  mimeType: string;
}

export function buildPrompt(mode: PhotoAnalysisMode, nutrients: NutrientDescriptor[]): string {
  const nutrientList = nutrients.map((n) => `- ${n.key}: ${n.name} (單位: ${n.unit})`).join("\n");

  const schemaExample = `{
  "items": [
    {
      "name": "食物或品項名稱",
      "quantity": 1,
      "unit": "碗/份/克 等份量單位",
      "nutrients": { ${nutrients.map((n) => `"${n.key}": 0`).join(", ")} }
    }
  ]
}`;

  const task =
    mode === "food"
      ? "這是一張餐點照片。請辨識照片中的每一種食物品項,估計其份量,並估算各項營養素含量。"
      : "這是一張食品營養標示照片。請讀取標示表上的數值(以每份/每次食用量為準),對應到下列營養素。若標示上沒有某個營養素,填 0。";

  const fallback =
    mode === "food"
      ? "如果照片中沒有看到任何食物或餐點(例如拍到的是人、風景、物品、空白畫面等不相干的內容),請回傳 \"items\": []。"
      : "如果照片中沒有看到營養標示表(例如拍到的是食物本身、人、風景或其他不相干的內容),請回傳 \"items\": []。";

  return `你是專業的營養分析助手。${task}

請只使用以下營養素 key(不要新增其他 key):
${nutrientList}

${fallback}

請務必只回傳嚴格的 JSON,不要包含任何說明文字或 markdown 標記,格式如下:
${schemaExample}

數值請填數字(不要帶單位文字),估計不到的營養素請填 0。`;
}

export function extractJson(raw: string, providerLabel: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`${providerLabel} 回傳的內容不是有效的 JSON,請稍後再試一次。`);
    }
    return JSON.parse(match[0]);
  }
}

export function normalizeResult(parsed: unknown, nutrients: NutrientDescriptor[]): PhotoAnalysisResult {
  const validKeys = new Set(nutrients.map((n) => n.key));
  const rawItems = (parsed as { items?: unknown[] })?.items;

  if (!Array.isArray(rawItems)) {
    throw new Error("AI 回傳的 JSON 缺少 items 陣列。");
  }

  const items: AnalyzedItem[] = rawItems.map((raw) => {
    const item = raw as Record<string, unknown>;
    const rawNutrients = (item.nutrients as Record<string, unknown>) ?? {};
    const nutrientEntries: Record<string, number> = {};

    for (const key of Object.keys(rawNutrients)) {
      if (!validKeys.has(key)) continue;
      const value = Number(rawNutrients[key]);
      nutrientEntries[key] = Number.isFinite(value) ? value : 0;
    }
    // fill any missing nutrient with 0 so downstream code can rely on every key being present
    for (const n of nutrients) {
      if (!(n.key in nutrientEntries)) nutrientEntries[n.key] = 0;
    }

    return {
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "未命名品項",
      quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1,
      unit: typeof item.unit === "string" && item.unit.trim() ? item.unit.trim() : "份",
      nutrients: nutrientEntries,
    };
  });

  return { items };
}
