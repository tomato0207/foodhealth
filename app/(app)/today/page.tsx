import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { todayDateString } from "@/lib/date";
import { sumIntake } from "@/lib/intake";
import { NUTRIENT_ICONS, type MealType } from "@/lib/types";
import RecordCard from "@/app/_components/RecordCard";
import CircularProgress from "@/app/_components/CircularProgress";

export default async function TodayPage() {
  const user = await requireUser();
  const mealDate = todayDateString();

  const [targets, records] = await Promise.all([
    prisma.userNutrientTarget.findMany({
      where: { userId: user.id, nutrient: { trackable: true } },
      include: { nutrient: true },
      orderBy: { nutrient: { sortOrder: "asc" } },
    }),
    prisma.mealRecord.findMany({
      where: { userId: user.id, mealDate },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const intake = sumIntake(records);
  const calorieTarget = targets.find((t) => t.nutrient.key === "calorie");
  const otherTargets = targets.filter((t) => t.nutrient.key !== "calorie");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">今日營養素</h1>
          <p className="text-sm text-gray-500">{mealDate}</p>
        </div>
        <Link
          href="/today/log/new"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          + 新增紀錄
        </Link>
      </div>

      {targets.length === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="text-xl" aria-hidden>
            ⚠️
          </span>
          <p>尚未設定個人資料,請先前往「個人資訊」頁面填寫,系統才能計算每日營養素目標。</p>
        </div>
      ) : (
        <section className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-sm shadow-black/[0.03] backdrop-blur">
          <div className="flex flex-col items-center gap-6 border-b border-black/5 pb-6 sm:flex-row sm:items-center">
            {calorieTarget && (
              <CircularProgress
                pct={calorieTarget.dailyTarget > 0 ? ((intake.calorie ?? 0) / calorieTarget.dailyTarget) * 100 : 0}
                size={128}
                strokeWidth={11}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl" aria-hidden>
                    🔥
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{Math.round(intake.calorie ?? 0)}</span>
                </div>
              </CircularProgress>
            )}
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">熱量攝取</p>
              <p className="text-3xl font-semibold text-gray-900">
                {Math.round(intake.calorie ?? 0)}
                <span className="ml-1 text-base font-normal text-gray-400">
                  / {calorieTarget?.dailyTarget ?? 0} kcal
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            {otherTargets.map((target) => {
              const current = intake[target.nutrient.key] ?? 0;
              const pct = target.dailyTarget > 0 ? Math.min(100, (current / target.dailyTarget) * 100) : 0;
              return (
                <div key={target.nutrientId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <span aria-hidden>{NUTRIENT_ICONS[target.nutrient.key] ?? "•"}</span>
                      {target.nutrient.name}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-emerald-100">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {current.toFixed(1)} / {target.dailyTarget} {target.nutrient.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">今日紀錄</h2>
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 py-10 text-center">
            <span className="text-3xl" aria-hidden>
              🍽️
            </span>
            <p className="text-sm text-gray-500">今天還沒有任何紀錄,拍張照片開始吧!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                id={record.id}
                mealType={record.mealType as MealType}
                imageId={record.imageId}
                items={record.items}
                createdAt={record.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
