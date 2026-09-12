import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreateBadgeForm } from "./CreateBadgeForm";
import { toggleBadgeActiveAction } from "./actions";

export const metadata: Metadata = { title: "Badges — Zumi admin" };

export default async function AdminBadgesPage() {
  const { supabase } = await requireAdminSession();
  const { data: badges } = await supabase.from("badges").select("*").order("created_at");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zumi-ink">Badges</h1>

      <Card className="mb-6">
        <CreateBadgeForm />
      </Card>

      <div className="space-y-2">
        {(badges ?? []).map((badge) => (
          <Card key={badge.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-bold text-zumi-ink">
                🏅 {badge.name} <span className="text-xs text-zumi-slate-500">({badge.code})</span>
              </p>
              {badge.description ? (
                <p className="text-sm text-zumi-slate-500">{badge.description}</p>
              ) : null}
              <p className="mt-1 text-xs text-zumi-slate-500">
                {JSON.stringify(badge.criteria)}
              </p>
            </div>
            <form action={toggleBadgeActiveAction.bind(null, badge.id, badge.is_active)}>
              <Button type="submit" variant={badge.is_active ? "secondary" : "primary"} size="md">
                {badge.is_active ? "Active" : "Inactive"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
