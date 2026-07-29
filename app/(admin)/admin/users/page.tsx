import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import UserRow from "./UserRow";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const registrationOpen = process.env.ALLOW_REGISTRATION !== "false";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">使用者管理</h1>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          + 新增使用者
        </Link>
      </div>
      {!registrationOpen && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="text-xl" aria-hidden>
            🔒
          </span>
          <p>目前已關閉自行註冊(`ALLOW_REGISTRATION=false`),新使用者請在此頁面手動新增。</p>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white/90 shadow-sm shadow-black/[0.03] backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">姓名</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">角色</th>
              <th className="px-4 py-3 font-medium">狀態</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                id={user.id}
                email={user.email}
                name={user.name}
                role={user.role}
                active={user.active}
                isSelf={user.id === admin.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
