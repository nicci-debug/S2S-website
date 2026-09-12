import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdminSession } from "@/lib/auth-helpers";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/difficulty-levels", label: "Difficulty levels" },
  { href: "/admin/badges", label: "Badges" },
  { href: "/admin/content", label: "AI content" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-zumi-cloud">
      <header className="border-b border-zumi-slate-200 bg-zumi-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="text-xl font-extrabold text-white">
            zumi admin
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="text-white hover:bg-white/10">
              Log out
            </Button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
