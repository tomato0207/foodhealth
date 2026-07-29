import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate, todayDateString } from "@/lib/date";
import type { MealType } from "@/lib/types";
import RecordCard from "@/app/_components/RecordCard";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const from = params.from || daysAgo(13);
  const to = params.to || todayDateString();

  const records = await prisma.mealRecord.findMany({
    where: { userId: user.id, mealDate: { gte: from, lte: to } },
    include: { items: true },
    orderBy: [{ mealDate: "desc" }, { createdAt: "asc" }],
  });

  const byDate = new Map<string, typeof records>();
  for (const record of records) {
    const list = byDate.get(record.mealDate) ?? [];
    list.push(record);
    byDate.set(record.mealDate, list);
  }
  const dates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">紀錄</h1>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-white/90 p-4 text-sm shadow-sm shadow-black/[0.03] backdrop-blur">
        <label className="flex flex-col gap-1">
          從
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          到
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          篩選
        </button>
      </form>

      {dates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 py-10 text-center">
          <span className="text-3xl" aria-hidden>
            📭
          </span>
          <p className="text-sm text-gray-500">這段期間沒有任何紀錄。</p>
        </div>
      ) : (
        dates.map((date) => (
          <section key={date}>
            <h2 className="mb-2 font-medium text-gray-700">{date}</h2>
            <div className="flex flex-col gap-3">
              {byDate.get(date)!.map((record) => (
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
          </section>
        ))
      )}
    </div>
  );
}
