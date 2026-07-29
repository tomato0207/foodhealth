import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/app/_components/DeleteButton";

export default async function AdminNutrientsPage() {
  const nutrients = await prisma.nutrient.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">營養素管理</h1>
        <Link href="/admin/nutrients/new" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-emerald-700">
          + 新增營養素
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-emerald-100 text-left">
            <th className="py-2">名稱</th>
            <th className="py-2">Key</th>
            <th className="py-2">單位</th>
            <th className="py-2">分類</th>
            <th className="py-2">預設每日建議量</th>
            <th className="py-2">可追蹤</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {nutrients.map((n) => (
            <tr key={n.id} className="border-b border-emerald-100">
              <td className="py-2">{n.name}</td>
              <td className="py-2 text-gray-400">{n.key}</td>
              <td className="py-2">{n.unit}</td>
              <td className="py-2">{n.category}</td>
              <td className="py-2">{n.defaultDailyValue}</td>
              <td className="py-2">
                {n.trackable ? (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">是</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">否</span>
                )}
              </td>
              <td className="flex gap-3 py-2">
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
  );
}
