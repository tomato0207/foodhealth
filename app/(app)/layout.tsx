import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NavBar from "@/app/_components/NavBar";

const LINKS = [
  { href: "/today", label: "今日營養素" },
  { href: "/records", label: "紀錄" },
  { href: "/profile", label: "個人資訊" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={user.name} links={LINKS} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
