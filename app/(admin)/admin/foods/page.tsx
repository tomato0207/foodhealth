import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/app/_components/DeleteButton";

const PAGE_SIZE = 50;

export default async function AdminFoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const where = query ? { name: { contains: query } } : undefined;

  const [foods, total] = await Promise.all([
    prisma.food.findMany({ where, orderBy: { name: "asc" }, take: PAGE_SIZE }),
    prisma.food.count({ where }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">食物管理</h1>
        <Link
          href="/admin/foods/new"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          + 新增食物
        </Link>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/90 shadow-sm shadow-black/[0.03] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/5 p-4">
          <form className="flex items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              搜尋名稱
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="例如:白飯"
                className="w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700">
              搜尋
            </button>
          </form>
          <p className="text-sm text-gray-500">
            共 {total} 筆{query && `符合「${query}」的結果`}
            {total > PAGE_SIZE && `,僅顯示前 ${PAGE_SIZE} 筆`}
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">名稱</th>
              <th className="px-4 py-3 font-medium">分類</th>
              <th className="px-4 py-3 font-medium">份量</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id} className="border-b border-black/5 last:border-0 hover:bg-emerald-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{food.name}</td>
                <td className="px-4 py-3 text-gray-500">{food.category}</td>
                <td className="px-4 py-3 text-gray-500">
                  {food.servingSize}
                  {food.servingUnit}
                </td>
                <td className="flex gap-3 px-4 py-3">
                  <Link href={`/admin/foods/${food.id}`} className="text-sm text-emerald-600 underline hover:text-emerald-700">
                    編輯
                  </Link>
                  <DeleteButton endpoint={`/api/foods/${food.id}`} confirmText={`確定要刪除「${food.name}」嗎?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
