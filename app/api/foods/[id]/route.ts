import { prisma } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin();
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

  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) return Response.json({ error: "找不到此食物。" }, { status: 404 });

  // Only the trackable nutrients are ever shown/submitted by the admin food form. Upserting just
  // those (instead of deleting all FoodNutrient rows first) preserves any non-trackable data
  // (e.g. amino/fatty acid breakdowns from a bulk TFND import) that isn't part of this form.
  const nutrients = await prisma.nutrient.findMany({ where: { trackable: true } });

  await prisma.$transaction([
    prisma.food.update({ where: { id }, data: { name, servingSize, servingUnit, category, note } }),
    ...nutrients
      .map((n) => ({ nutrientId: n.id, amountPerServing: Number(nutrientAmounts?.[n.key]) }))
      .filter((n) => Number.isFinite(n.amountPerServing))
      .map((n) =>
        prisma.foodNutrient.upsert({
          where: { foodId_nutrientId: { foodId: id, nutrientId: n.nutrientId } },
          update: { amountPerServing: n.amountPerServing },
          create: { foodId: id, nutrientId: n.nutrientId, amountPerServing: n.amountPerServing },
        })
      ),
  ]);

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  await prisma.food.delete({ where: { id } });
  return Response.json({ ok: true });
}
