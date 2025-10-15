import Container from "@/components/Container";
import { supabaseAdmin } from "@/lib/supabase/admin"; // LINE 2: named import
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await getProfile();
  if (!me) redirect("/login");
  if (!["admin", "subadmin"].includes(me.role)) redirect("/policies");

  const admin = supabaseAdmin(); // LINE 11: call the factory
  const { data: list, error } = await admin.auth.admin.listUsers();
  if (error) {
    return (
      <Container>
        <h1 className="text-2xl font-extrabold mt-6 mb-4">Users</h1>
        <div className="card p-4 text-red-600">Error: {error.message}</div>
      </Container>
    );
  }

  const { data: profiles, error: profilesError } = await admin.from("profiles").select("id");
  if (profilesError) {
    return (
      <Container>
        <h1 className="text-2xl font-extrabold mt-6 mb-4">Users</h1>
        <div className="card p-4 text-red-600">Error: {profilesError.message}</div>
      </Container>
    );
  }

  const profileIds = profiles?.map(p => p.id) ?? [];
  let rows = list?.users.filter(u => profileIds.includes(u.id)) ?? [];

  if (me.role === "subadmin") {
    rows = rows.filter(u => u.user_metadata?.created_by === me.id);
  }

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Users</h1>
      <div className="card p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-500">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u: any) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.user_metadata?.role ?? "-"}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      u.user_metadata?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : u.user_metadata?.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.user_metadata?.status ?? "pending"}
                  </span>
                </td>
                <td className="py-2">
                  {new Date(u.created_at).toLocaleString("en-GB")}
                </td>
                <td className="py-2 text-right">
                  <a href={`/admin/users/${u.id}`} className="underline">Manage</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
