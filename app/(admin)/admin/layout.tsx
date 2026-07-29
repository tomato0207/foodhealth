import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NavBar from "@/app/_components/NavBar";

const LINKS = [
  { href: "/admin/foods", label: "食物管理" },
  { href: "/admin/nutrients", label: "營養素管理" },
  { href: "/admin/users", label: "使用者管理" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/today");

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={`${user.name}(管理員)`} links={LINKS} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
