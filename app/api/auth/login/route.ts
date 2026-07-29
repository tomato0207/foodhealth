import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "請輸入 Email 與密碼。" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Email 或密碼錯誤。" }, { status: 401 });
  }
  if (!user.active) {
    return Response.json({ error: "此帳號已被停用。" }, { status: 403 });
  }

  await createSession(user.id);

  return Response.json({ ok: true, role: user.role });
}
