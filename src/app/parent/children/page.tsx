import type { Metadata } from "next";
import Link from "next/link";
import { requireParentSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AVATAR_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = { title: "Your children — Zumi" };

export default async function ChildrenPage() {
  const { supabase, parentProfile } = await requireParentSession();

  const { data: children } = await supabase
    .from("children")
    .select("id, name, age, grade, home_language, avatar_id")
    .eq("parent_id", parentProfile.id)
    .order("created_at");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zumi-ink">Your children</h1>
        <Link href="/parent/children/new">
          <Button>Add a child</Button>
        </Link>
      </div>

      {!children || children.length === 0 ? (
        <Card>
          <p className="text-zumi-slate-500">
            You haven&apos;t added a child yet.{" "}
            <Link href="/parent/children/new" className="font-semibold text-zumi-violet-600">
              Add your first child
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => {
            const avatar =
              AVATAR_OPTIONS.find((a) => a.id === child.avatar_id) ?? AVATAR_OPTIONS[0];
            return (
              <Card key={child.id} className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zumi-violet-50 text-3xl">
                  {avatar.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-zumi-ink">{child.name}</p>
                  <p className="text-sm text-zumi-slate-500">
                    {child.grade ? `${child.grade} · ` : ""}Age {child.age}
                  </p>
                </div>
                <Link href={`/parent/children/${child.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
