import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { calculateNutrientTargets } from "@/lib/nutrition";
import type { ActivityLevel, Gender, Goal } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ nutrientId: string }> }
) {
  const { nutrientId } = await params;
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const body = await request.json().catch(() => null);
  const dailyTarget = Number(body?.dailyTarget);
  if (!Number.isFinite(dailyTarget) || dailyTarget < 0) {
    return Response.json({ error: "目標數值不正確。" }, { status: 400 });
  }

  const nutrient = await prisma.nutrient.findUnique({ where: { id: nutrientId } });
  if (!nutrient) return Response.json({ error: "找不到此營養素。" }, { status: 404 });

  await prisma.userNutrientTarget.upsert({
    where: { userId_nutrientId: { userId: user.id, nutrientId } },
    update: { dailyTarget, overridden: true },
    create: { userId: user.id, nutrientId, dailyTarget, overridden: true },
  });

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ nutrientId: string }> }
) {
  const { nutrientId } = await params;
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const nutrient = await prisma.nutrient.findUnique({ where: { id: nutrientId } });
  if (!nutrient) return Response.json({ error: "找不到此營養素。" }, { status: 404 });

  if (!profile) {
    await prisma.userNutrientTarget.deleteMany({ where: { userId: user.id, nutrientId } });
    return Response.json({ ok: true });
  }

  const profileInput = {
    gender: profile.gender as Gender,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel as ActivityLevel,
    goal: profile.goal as Goal,
  };
  const [computed] = calculateNutrientTargets(profileInput, [nutrient]);

  await prisma.userNutrientTarget.upsert({
    where: { userId_nutrientId: { userId: user.id, nutrientId } },
    update: { dailyTarget: computed.dailyTarget, overridden: false },
    create: { userId: user.id, nutrientId, dailyTarget: computed.dailyTarget, overridden: false },
  });

  return Response.json({ ok: true, dailyTarget: computed.dailyTarget });
}
