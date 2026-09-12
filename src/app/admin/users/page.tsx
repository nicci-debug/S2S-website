import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth-helpers";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Users — Zumi admin" };

export default async function AdminUsersPage() {
  const { supabase } = await requireAdminSession();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zumi-ink">Users</h1>
      <p className="mb-6 text-sm text-zumi-slate-500">
        Read-only. Roles are granted by updating <code>users.role</code> directly in the database —
        see README.md.
      </p>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-zumi-cloud text-xs uppercase text-zumi-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-zumi-slate-200">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      user.role === "admin"
                        ? "rounded-full bg-zumi-coral-500/10 px-2 py-0.5 text-xs font-bold text-zumi-coral-600"
                        : "rounded-full bg-zumi-violet-100 px-2 py-0.5 text-xs font-bold text-zumi-violet-700"
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zumi-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
