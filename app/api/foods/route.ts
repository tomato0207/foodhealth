import { prisma } from "@/lib/db";
import { requireAdmin, requireUser, AuthError } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const foods = await prisma.food.findMany({
    where: q ? { name: { contains: q } } : undefined,
    include: { nutrients: { include: { nutrient: true } } },
    orderBy: { name: "asc" },
    take: 20,
  });

  return Response.json({
    foods: foods.map((food) => ({
      id: food.id,
      name: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      category: food.category,
      nutrients: Object.fromEntries(food.nutrients.map((fn) => [fn.nutrient.key, fn.amountPerServing])),
    })),
  });
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const servingSize = Number(body?.servingSize);
  const servingUnit = typeof body?.servingUnit === "string" ? body.servingUnit.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : null;
  const nutrientAmounts = body?.nutrientAmounts as Record<string, number> | undefined;

  if (!name || !servingUnit || !category || !Number.isFinite(servingSize) || servingSize <= 0) {
    return Response.json({ error: "請完整填寫食物名稱、份量、單位與分類。" }, { status: 400 });
  }

  const nutrients = await prisma.nutrient.findMany();
  const nutrientCreates = nutrients
    .map((n) => ({ nutrientId: n.id, amountPerServing: Number(nutrientAmounts?.[n.key]) }))
    .filter((n) => Number.isFinite(n.amountPerServing));

  const food = await prisma.food.create({
    data: {
      name,
      servingSize,
      servingUnit,
      category,
      note,
      createdById: admin.id,
      nutrients: { create: nutrientCreates },
    },
  });

  return Response.json({ ok: true, id: food.id });
}
