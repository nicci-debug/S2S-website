import Link from "next/link";
import type { ReactNode } from "react";
import { requireParentSession } from "@/lib/auth-helpers";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const { parentProfile } = await requireParentSession();

  return (
    <div className="min-h-screen bg-zumi-cloud">
      <header className="border-b border-zumi-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/parent/dashboard" className="text-xl font-extrabold text-zumi-violet-700">
            zumi
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-zumi-slate-500">
            <Link href="/parent/dashboard" className="hover:text-zumi-ink">
              Dashboard
            </Link>
            <Link href="/parent/children" className="hover:text-zumi-ink">
              Children
            </Link>
            <Link href="/parent/practice/new" className="hover:text-zumi-ink">
              Create Practice
            </Link>
            <span className="hidden text-zumi-slate-300 sm:inline">|</span>
            <span className="hidden text-zumi-slate-500 sm:inline">
              {parentProfile.display_name}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="md">
                Log out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
