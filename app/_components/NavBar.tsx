"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavBarProps {
  name: string;
  links: { href: string; label: string }[];
}

export default function NavBar({ name, links }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 shadow-sm shadow-black/[0.02] backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-1 text-sm">
          <span className="mr-3 flex items-center gap-1.5 font-semibold text-emerald-700">
            <span aria-hidden>🌿</span>
            <span className="hidden sm:inline">營養管家</span>
          </span>
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700"
                    : "rounded-full px-3 py-1.5 text-gray-500 transition-colors hover:bg-black/[0.03] hover:text-emerald-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              {name.slice(0, 1)}
            </span>
            <span className="text-gray-600">{name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full px-3 py-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  );
}
