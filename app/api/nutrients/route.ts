import { prisma } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const defaultDailyValue = Number(body?.defaultDailyValue);
  const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
  const trackable = body?.trackable === undefined ? true : Boolean(body.trackable);

  if (!/^[a-z0-9_]+$/.test(key) || !name || !unit || !category || !Number.isFinite(defaultDailyValue) || defaultDailyValue < 0) {
    return Response.json(
      { error: "請確認 key(僅限小寫英數與底線)、名稱、單位、分類與預設每日建議量皆正確。" },
      { status: 400 }
    );
  }

  const existing = await prisma.nutrient.findUnique({ where: { key } });
  if (existing) {
    return Response.json({ error: "此 key 已存在。" }, { status: 409 });
  }

  const nutrient = await prisma.nutrient.create({
    data: { key, name, unit, category, defaultDailyValue, sortOrder, trackable },
  });

  return Response.json({ ok: true, id: nutrient.id });
}
