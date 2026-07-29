import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ActivityLevel, Gender, Goal } from "@/lib/types";
import ProfileForm from "./ProfileForm";
import TargetsTable from "./TargetsTable";

export default async function ProfilePage() {
  const user = await requireUser();

  const [profile, targets] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.userNutrientTarget.findMany({
      where: { userId: user.id, nutrient: { trackable: true } },
      include: { nutrient: true },
      orderBy: { nutrient: { sortOrder: "asc" } },
    }),
  ]);

  const rows = targets.map((t) => ({
    nutrientId: t.nutrientId,
    key: t.nutrient.key,
    name: t.nutrient.name,
    unit: t.nutrient.unit,
    category: t.nutrient.category,
    dailyTarget: t.dailyTarget,
    overridden: t.overridden,
  }));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-1 text-2xl font-semibold">個人資訊</h1>
        <p className="mb-4 text-sm text-gray-500">
          填寫個人資料後,系統會自動計算你每日的營養素目標。
        </p>
        <ProfileForm
          initial={
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
        />
      </section>

      {rows.length > 0 && (
        <section>
          <h2 className="mb-1 text-xl font-semibold">每日營養素目標</h2>
          <p className="mb-4 text-sm text-gray-500">
            可個別覆寫目標數值;「重設」會恢復系統依個人資料計算出的建議值。
          </p>
          <TargetsTable rows={rows} />
        </section>
      )}
    </div>
  );
}
