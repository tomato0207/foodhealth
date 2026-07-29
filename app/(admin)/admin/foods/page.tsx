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
        <h1 className="text-2xl font-semibold">食物管理</h1>
        <Link href="/admin/foods/new" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-emerald-700">
          + 新增食物
        </Link>
      </div>

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
        <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-emerald-700">
          搜尋
        </button>
      </form>

      <p className="text-sm text-gray-500">
        共 {total} 筆{query && `符合「${query}」的結果`}
        {total > PAGE_SIZE && `,僅顯示前 ${PAGE_SIZE} 筆,請縮小搜尋範圍`}
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-emerald-100 text-left">
            <th className="py-2">名稱</th>
            <th className="py-2">分類</th>
            <th className="py-2">份量</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id} className="border-b border-emerald-100">
              <td className="py-2">{food.name}</td>
              <td className="py-2">{food.category}</td>
              <td className="py-2">
                {food.servingSize}
                {food.servingUnit}
              </td>
              <td className="flex gap-3 py-2">
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
  );
}
