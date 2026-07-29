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
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span aria-hidden>🌿</span>營養管家
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? "font-medium text-emerald-600"
                  : "text-gray-500 hover:text-emerald-700"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{name}</span>
          <button onClick={handleLogout} className="text-emerald-600 underline hover:text-emerald-700">
            登出
          </button>
        </div>
      </div>
    </header>
  );
}
