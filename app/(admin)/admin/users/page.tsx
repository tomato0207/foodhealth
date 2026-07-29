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
        <h1 className="text-2xl font-semibold">使用者管理</h1>
        <Link href="/admin/users/new" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-emerald-700">
          + 新增使用者
        </Link>
      </div>
      {!registrationOpen && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          目前已關閉自行註冊(`ALLOW_REGISTRATION=false`),新使用者請在此頁面手動新增。
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-emerald-100 text-left">
            <th className="py-2">姓名</th>
            <th className="py-2">Email</th>
            <th className="py-2">角色</th>
            <th className="py-2">狀態</th>
            <th className="py-2"></th>
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
  );
}
