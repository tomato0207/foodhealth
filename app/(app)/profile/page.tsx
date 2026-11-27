import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ActivityLevel, Gender, Goal } from "@/lib/types";
import ProfileEditor from "./ProfileEditor";

export default async function ProfilePage() {
  const user = await requireUser();

  const [profile, nutrients, targets] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.nutrient.findMany({ where: { trackable: true }, orderBy: { sortOrder: "asc" } }),
    prisma.userNutrientTarget.findMany({ where: { userId: user.id, nutrient: { trackable: true } } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">個人資訊</h1>
        <p className="mt-1 text-sm text-gray-500">填寫個人資料後,系統會自動計算你每日的營養素目標。</p>
      </div>

      <ProfileEditor
        initialProfile={
          profile
            ? {
                gender: profile.gender as Gender,
                birthYear: profile.birthYear,
                heightCm: profile.heightCm,
                weightKg: profile.weightKg,
                activityLevel: profile.activityLevel as ActivityLevel,
                goal: profile.goal as Goal,
              }
            : null
        }
        nutrients={nutrients.map((n) => ({
          id: n.id,
          key: n.key,
          name: n.name,
          unit: n.unit,
          category: n.category,
          defaultDailyValue: n.defaultDailyValue,
        }))}
        targets={targets.map((t) => ({
          nutrientId: t.nutrientId,
          dailyTarget: t.dailyTarget,
          overridden: t.overridden,
        }))}
      />
    </div>
  );
}
