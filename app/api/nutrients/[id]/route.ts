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
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const defaultDailyValue = Number(body?.defaultDailyValue);
  const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
  const trackable = body?.trackable === undefined ? true : Boolean(body.trackable);

  if (!name || !unit || !category || !Number.isFinite(defaultDailyValue) || defaultDailyValue < 0) {
    return Response.json({ error: "請確認名稱、單位、分類與預設每日建議量皆正確。" }, { status: 400 });
  }

  const nutrient = await prisma.nutrient.findUnique({ where: { id } });
  if (!nutrient) return Response.json({ error: "找不到此營養素。" }, { status: 404 });

  await prisma.nutrient.update({
    where: { id },
    data: { name, unit, category, defaultDailyValue, sortOrder, trackable },
  });
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

  await prisma.nutrient.delete({ where: { id } });
  return Response.json({ ok: true });
}
