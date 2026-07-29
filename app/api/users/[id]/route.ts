import { prisma } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: "需要管理員權限。" }, { status: error.code === "FORBIDDEN" ? 403 : 401 });
    }
    throw error;
  }

  if (id === admin.id) {
    return Response.json({ error: "無法修改自己的帳號權限。" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const data: { role?: string; active?: boolean } = {};

  if (body?.role !== undefined) {
    if (body.role !== "USER" && body.role !== "ADMIN") {
      return Response.json({ error: "角色不正確。" }, { status: 400 });
    }
    data.role = body.role;
  }
  if (body?.active !== undefined) {
    data.active = Boolean(body.active);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return Response.json({ error: "找不到此使用者。" }, { status: 404 });

  await prisma.user.update({ where: { id }, data });
  if (data.active === false) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return Response.json({ ok: true });
}
