export interface DraftItem {
  clientId: string;
  itemName: string;
  foodId: string | null;
  quantity: number;
  unit: string;
  /** total nutrient contribution of this item; for foodId items this is a client-side preview only,
   * the server recomputes the authoritative value from Food/FoodNutrient at save time. */
  nutrients: Record<string, number>;
  estimatedByAI: boolean;
  perServingNutrients: Record<string, number> | null;
  /** size of one serving in `unit` (e.g. 100 克) that perServingNutrients refers to; quantity is in the same unit. */
  servingSize?: number;
}

/** a photo-recognition backend as offered in the UI; `configured` is false when its env vars are missing */
export interface AiProviderOption {
  id: "gemini" | "lmstudio";
  label: string;
  configured: boolean;
}

export interface NutrientDescriptor {
  key: string;
  name: string;
  unit: string;
}
