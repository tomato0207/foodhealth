import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  if (process.env.ALLOW_REGISTRATION === "false") {
    return Response.json({ error: "目前未開放註冊,請聯絡管理員為你建立帳號。" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!email || !password || !name) {
    return Response.json({ error: "請填寫姓名、Email 與密碼。" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "密碼至少需要 8 個字元。" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "此 Email 已被註冊。" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password), role: "USER" },
  });

  await createSession(user.id);

  return Response.json({ ok: true });
}
