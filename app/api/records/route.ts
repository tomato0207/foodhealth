import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import type { MealType, RecordSource } from "@/lib/types";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const SOURCES: RecordSource[] = ["MANUAL", "AI_FOOD_PHOTO", "AI_LABEL_PHOTO"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface ItemInput {
  foodId?: string;
  itemName?: string;
  quantity: number;
  unit?: string;
  nutrients?: Record<string, number>;
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const body = await request.json().catch(() => null);
  const mealDate = body?.mealDate;
  const mealType = body?.mealType as MealType;
  const source = body?.source as RecordSource;
  const imageId = typeof body?.imageId === "string" ? body.imageId : undefined;
  const items = Array.isArray(body?.items) ? (body.items as ItemInput[]) : [];

  if (typeof mealDate !== "string" || !DATE_RE.test(mealDate)) {
    return Response.json({ error: "日期格式不正確。" }, { status: 400 });
  }
  if (!MEAL_TYPES.includes(mealType)) {
    return Response.json({ error: "餐別不正確。" }, { status: 400 });
  }
  if (!SOURCES.includes(source)) {
    return Response.json({ error: "來源不正確。" }, { status: 400 });
  }
  if (items.length === 0) {
    return Response.json({ error: "請至少新增一項食物。" }, { status: 400 });
  }

  if (imageId) {
    const image = await prisma.uploadedImage.findUnique({ where: { id: imageId } });
    if (!image || image.userId !== user.id) {
      return Response.json({ error: "找不到指定的照片。" }, { status: 400 });
    }
  }

  const nutrients = await prisma.nutrient.findMany();
  const nutrientKeys = new Set(nutrients.map((n) => n.key));

  const preparedItems: {
    itemName: string;
    foodId: string | null;
    quantity: number;
    unit: string;
    nutrientSnapshot: string;
    estimatedByAI: boolean;
  }[] = [];

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return Response.json({ error: "份量必須是大於 0 的數字。" }, { status: 400 });
    }

    if (item.foodId) {
      const food = await prisma.food.findUnique({
        where: { id: item.foodId },
        include: { nutrients: { include: { nutrient: true } } },
      });
      if (!food) return Response.json({ error: "找不到指定的食物。" }, { status: 400 });

      const snapshot: Record<string, number> = {};
      for (const fn of food.nutrients) {
        snapshot[fn.nutrient.key] = fn.amountPerServing * quantity;
      }

      preparedItems.push({
        itemName: item.itemName?.trim() || food.name,
        foodId: food.id,
        quantity,
        unit: item.unit?.trim() || food.servingUnit,
        nutrientSnapshot: JSON.stringify(snapshot),
        estimatedByAI: source !== "MANUAL",
      });
    } else {
      const itemName = item.itemName?.trim();
      if (!itemName) {
        return Response.json({ error: "請輸入食物名稱。" }, { status: 400 });
      }
      const snapshot: Record<string, number> = {};
      for (const [key, value] of Object.entries(item.nutrients ?? {})) {
        if (!nutrientKeys.has(key)) continue;
        const num = Number(value);
        snapshot[key] = Number.isFinite(num) ? num : 0;
      }

      preparedItems.push({
        itemName,
        foodId: null,
        quantity,
        unit: item.unit?.trim() || "份",
        nutrientSnapshot: JSON.stringify(snapshot),
        estimatedByAI: source !== "MANUAL",
      });
    }
  }

  const record = await prisma.mealRecord.create({
    data: {
      userId: user.id,
      mealDate,
      mealType,
      source,
      imageId,
      items: { create: preparedItems },
    },
    include: { items: true },
  });

  return Response.json({ ok: true, id: record.id });
}
