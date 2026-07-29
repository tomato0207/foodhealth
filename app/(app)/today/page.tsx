import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { todayDateString } from "@/lib/date";
import { sumIntake } from "@/lib/intake";
import type { MealType } from "@/lib/types";
import RecordCard from "@/app/_components/RecordCard";

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">今日營養素</h1>
          <p className="text-sm text-gray-500">{mealDate}</p>
        </div>
        <Link href="/today/log/new" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-emerald-700">
          + 新增紀錄
        </Link>
      </div>

      {targets.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          尚未設定個人資料,請先前往「個人資訊」頁面填寫,系統才能計算每日營養素目標。
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {targets.map((target) => {
            const current = intake[target.nutrient.key] ?? 0;
            const pct = target.dailyTarget > 0 ? Math.min(100, (current / target.dailyTarget) * 100) : 0;
            return (
              <div key={target.nutrientId}>
                <div className="flex justify-between text-sm">
                  <span>{target.nutrient.name}</span>
                  <span className="text-gray-500">
                    {current.toFixed(1)} / {target.dailyTarget} {target.nutrient.unit}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-emerald-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">今日紀錄</h2>
        {records.length === 0 ? (
          <p className="text-sm text-gray-500">今天還沒有任何紀錄。</p>
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
