import Container from "@/components/Container";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { gbp } from "@/lib/format";

export default async function SubAdminPage() {
  const me = await getProfile();
  if (!me) redirect("/login");
  if (me.role !== "subadmin") redirect("/policies");

  const admin = supabaseAdmin();
  const { data: policies, error } = await admin.from("policies").select("status,premium_gbp");
  if (error) console.error(error);

  const totalPolicies = policies?.length ?? 0;
  const activePolicies = policies?.filter(p => p.status === "active").length ?? 0;
  const totalRevenue = policies?.reduce((acc, p) => acc + (p.premium_gbp ?? 0), 0) ?? 0;

  return (
    <Container>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold">Sub-Admin Dashboard</h1>
        <p className="text-ink-500 mt-1">Welcome, {me.email}</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link href="/admin/users" className="bg-blue-600 text-white rounded-lg p-4 text-center font-semibold">Manage Users</Link>
          <Link href="/admin/users/create" className="bg-purple-600 text-white rounded-lg p-4 text-center font-semibold">Create User</Link>
          <Link href="/admin/policies/create" className="bg-green-600 text-white rounded-lg p-4 text-center font-semibold">Create Policy</Link>
          <form action="/api/auth/logout" method="post" className="contents">
            <button className="bg-gray-200 text-black rounded-lg p-4 text-center font-semibold w-full">Logout</button>
          </form>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Policies</h2>
            <p className="text-sm text-gray-500">Policies created by you</p>
            <p className="text-4xl font-bold mt-2">{totalPolicies}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-lg font-semibold text-gray-700">Active Policies</h2>
            <p className="text-sm text-gray-500">Currently active policies</p>
            <p className="text-4xl font-bold mt-2">{activePolicies}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
            <p className="text-sm text-gray-500">From all policies created</p>
            <p className="text-4xl font-bold mt-2">{gbp(totalRevenue)}</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
