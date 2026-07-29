import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/app/_components/DeleteButton";

export default async function AdminNutrientsPage() {
  const nutrients = await prisma.nutrient.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">營養素管理</h1>
        <Link
          href="/admin/nutrients/new"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          + 新增營養素
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white/90 shadow-sm shadow-black/[0.03] backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">名稱</th>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">單位</th>
              <th className="px-4 py-3 font-medium">分類</th>
              <th className="px-4 py-3 font-medium">預設每日建議量</th>
              <th className="px-4 py-3 font-medium">可追蹤</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {nutrients.map((n) => (
              <tr key={n.id} className="border-b border-black/5 last:border-0 hover:bg-emerald-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{n.name}</td>
                <td className="px-4 py-3 text-gray-400">{n.key}</td>
                <td className="px-4 py-3 text-gray-500">{n.unit}</td>
                <td className="px-4 py-3 text-gray-500">{n.category}</td>
                <td className="px-4 py-3 text-gray-500">{n.defaultDailyValue}</td>
                <td className="px-4 py-3">
                  {n.trackable ? (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">是</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">否</span>
                  )}
                </td>
                <td className="flex gap-3 px-4 py-3">
                  <Link href={`/admin/nutrients/${n.id}`} className="text-sm text-emerald-600 underline hover:text-emerald-700">
                    編輯
                  </Link>
                  <DeleteButton endpoint={`/api/nutrients/${n.id}`} confirmText={`確定要刪除「${n.name}」嗎?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
