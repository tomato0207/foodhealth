import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const record = await prisma.mealRecord.findUnique({ where: { id } });
  if (!record || record.userId !== user.id) {
    return Response.json({ error: "找不到此紀錄。" }, { status: 404 });
  }

  await prisma.mealRecord.delete({ where: { id } });
  return Response.json({ ok: true });
}
