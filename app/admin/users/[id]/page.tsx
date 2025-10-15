import Container from "@/components/Container";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserEditPage({ params }: { params: { id: string } }) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    redirect("/login");
  }

  const admin = supabaseAdmin();
  const { data: { user }, error } = await admin.auth.admin.getUserById(params.id);
  const { data: policies, error: policiesError } = await admin
    .from("policies")
    .select("*")
    .eq("customer_id", params.id);

  if (error || !user) {
    return (
      <Container>
        <h1 className="text-2xl font-extrabold mt-6 mb-4">Edit User</h1>
        <div className="card p-4 text-red-600">
          Error: {error?.message ?? "User not found"}
        </div>
      </Container>
    );
  }
  if (policiesError) {
    return (
      <Container>
        <h1 className="text-2xl font-extrabold mt-6 mb-4">Edit User</h1>
        <div className="card p-4 text-red-600">
          Error: {policiesError.message}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Edit User</h1>
      <div className="card p-6">
        <form action="/api/admin/update-user" method="post" className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <label className="block">
            <div className="hint mb-1">Name</div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="first_name"
                className="field"
                defaultValue={user.user_metadata.first_name || ''}
                placeholder="First name"
                required
              />
              <input
                type="text"
                name="last_name"
                className="field"
                defaultValue={user.user_metadata.last_name || ''}
                placeholder="Last name"
                required
              />
            </div>
          </label>
          <label className="block">
            <div className="hint mb-1">Address</div>
            <input
              type="text"
              name="address"
              className="field"
              defaultValue={user.user_metadata.address}
            />
          </label>
          <label className="block">
            <div className="hint mb-1">Date of Birth</div>
            <input
              type="date"
              name="dob"
              className="field"
              defaultValue={user.user_metadata.dob}
            />
          </label>
          <label className="block">
            <div className="hint mb-1">Email</div>
            <input
              type="email"
              name="email"
              className="field"
              defaultValue={user.email}
              disabled
            />
          </label>
          <label className="block">
            <div className="hint mb-1">Role</div>
            <select
              name="role"
              className="field"
              defaultValue={user.user_metadata.role}
            >
              <option value="customer">Customer</option>
              <option value="subadmin">Sub-Admin</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="block">
            <div className="hint mb-1">Status</div>
            <select
              name="status"
              className="field"
              defaultValue={user.user_metadata.status ?? "active"}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <button className="btn btn-gold">Update User</button>
        </form>
        <form action="/api/admin/delete-user" method="post" className="mt-4">
          <input type="hidden" name="id" value={user.id} />
          <button className="btn btn-red w-full">Delete User</button>
        </form>
        <div className="mt-6">
          <Link href="/admin/users" className="underline">
            Back to Users
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-extrabold mt-8 mb-4">Assigned Policies</h2>
      <div className="card p-4">
        {policies.length === 0 && <p>No policies assigned to this user.</p>}
        <div className="space-y-4">
          {policies.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.number}</div>
                <div className="text-sm text-ink-500">{p.vehicle.makeModel}</div>
              </div>
              <form action="/api/admin/unassign-policy" method="post">
                <input type="hidden" name="policy_id" value={p.id} />
                <button className="btn btn-outline">Unassign</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}