import Link from "next/link";
import type { ReactNode } from "react";
import { requireChildAccess } from "@/lib/auth-helpers";
import { AVATAR_OPTIONS } from "@/lib/constants";

export default async function ChildLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { child } = await requireChildAccess(childId);
  const avatar = AVATAR_OPTIONS.find((a) => a.id === child.avatar_id) ?? AVATAR_OPTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zumi-violet-50 to-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/parent/dashboard"
          className="text-sm font-semibold text-zumi-slate-500 hover:text-zumi-ink"
        >
          ← Exit
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{avatar.emoji}</span>
          <span className="font-bold text-zumi-ink">{child.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-12">{children}</main>
    </div>
  );
}
