import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { calculateNutrientTargets } from "@/lib/nutrition";
import type { ActivityLevel, Gender, Goal } from "@/lib/types";

const GENDERS: Gender[] = ["MALE", "FEMALE"];
const ACTIVITY_LEVELS: ActivityLevel[] = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"];
const GOALS: Goal[] = ["MAINTAIN", "CUT", "BULK"];

export async function PUT(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: "請先登入。" }, { status: 401 });
    throw error;
  }

  const body = await request.json().catch(() => null);
  const gender = body?.gender as Gender;
  const birthYear = Number(body?.birthYear);
  const heightCm = Number(body?.heightCm);
  const weightKg = Number(body?.weightKg);
  const activityLevel = body?.activityLevel as ActivityLevel;
  const goal = body?.goal as Goal;

  if (
    !GENDERS.includes(gender) ||
    !ACTIVITY_LEVELS.includes(activityLevel) ||
    !GOALS.includes(goal) ||
    !Number.isFinite(birthYear) ||
    birthYear < 1900 ||
    birthYear > new Date().getFullYear() ||
    !Number.isFinite(heightCm) ||
    heightCm < 50 ||
    heightCm > 260 ||
    !Number.isFinite(weightKg) ||
    weightKg < 20 ||
    weightKg > 400
  ) {
    return Response.json({ error: "個人資料格式不正確,請確認每個欄位。" }, { status: 400 });
  }

  const profileInput = { gender, birthYear, heightCm, weightKg, activityLevel, goal };

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: profileInput,
    create: { userId: user.id, ...profileInput },
  });

  const nutrients = await prisma.nutrient.findMany({
    where: { trackable: true },
    orderBy: { sortOrder: "asc" },
  });
  const existingTargets = await prisma.userNutrientTarget.findMany({ where: { userId: user.id } });
  const overriddenIds = new Set(existingTargets.filter((t) => t.overridden).map((t) => t.nutrientId));

  const computed = calculateNutrientTargets(profileInput, nutrients);

  await prisma.$transaction(
    computed
      .filter((target) => !overriddenIds.has(target.nutrientId))
      .map((target) =>
        prisma.userNutrientTarget.upsert({
          where: { userId_nutrientId: { userId: user.id, nutrientId: target.nutrientId } },
          update: { dailyTarget: target.dailyTarget, overridden: false },
          create: {
            userId: user.id,
            nutrientId: target.nutrientId,
            dailyTarget: target.dailyTarget,
            overridden: false,
          },
        })
      )
  );

  return Response.json({ ok: true });
}
