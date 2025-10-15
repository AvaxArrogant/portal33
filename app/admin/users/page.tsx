import Container from "@/components/Container";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserListClient from "@/components/UserListClient";

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

  // Fetch detailed profile information
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name, email, first_name, last_name, dob, address, phone, role");
  if (profilesError) {
    return (
      <Container>
        <h1 className="text-2xl font-extrabold mt-6 mb-4">Users</h1>
        <div className="card p-4 text-red-600">Error: {profilesError.message}</div>
      </Container>
    );
  }

  // Create a mapping of profile data by ID for quick lookup
  const profilesMap = (profiles || []).reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {} as Record<string, any>);
  
  // Filter users to only include those with profiles
  const profileIds = Object.keys(profilesMap);
  let rows = list?.users.filter(u => profileIds.includes(u.id)) ?? [];

  if (me.role === "subadmin") {
    rows = rows.filter(u => u.user_metadata?.created_by === me.id);
  }
  
  // Fetch policy counts for customers (fallback method)
  let policyCountMap: Record<string, number> = {};
  try {
    // First try using the RPC function (if it exists)
    const { data: policyCounts, error: policyRpcError } = await admin
      .rpc('get_customer_policy_counts');
      
    if (policyRpcError || !policyCounts) {
      // Fallback to a direct query
      console.log('Falling back to direct policy count query');
      const { data: policiesData } = await admin
        .from("policies")
        .select("customer_id");
        
      // Count policies manually
      policyCountMap = (policiesData || []).reduce((acc: Record<string, number>, policy: any) => {
        if (policy.customer_id) {
          acc[policy.customer_id] = (acc[policy.customer_id] || 0) + 1;
        }
        return acc;
      }, {});
    } else {
      // Use the RPC results
      policyCountMap = policyCounts.reduce((acc: Record<string, number>, item: any) => {
        acc[item.customer_id] = item.count;
        return acc;
      }, {});
    }
  } catch (error) {
    console.error('Error fetching policy counts:', error);
  }

  // Get total users count for each role
  const totalCustomers = rows.filter(u => u.user_metadata?.role === "customer").length;
  const totalAdmins = rows.filter(u => u.user_metadata?.role === "admin").length;
  const totalSubadmins = rows.filter(u => u.user_metadata?.role === "subadmin").length;

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Users Management</h1>
      
      {/* User stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 bg-blue-50">
          <h3 className="font-bold text-blue-800">Customers</h3>
          <p className="text-2xl">{totalCustomers}</p>
        </div>
        <div className="card p-4 bg-purple-50">
          <h3 className="font-bold text-purple-800">Admins</h3>
          <p className="text-2xl">{totalAdmins}</p>
        </div>
        <div className="card p-4 bg-green-50">
          <h3 className="font-bold text-green-800">Subadmins</h3>
          <p className="text-2xl">{totalSubadmins}</p>
        </div>
      </div>
      
      {/* User search and filter */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User List</h2>
          <Link href="/admin/users/create" className="btn btn-primary">
            Create New User
          </Link>
        </div>
        
        {/* Client-side user list with filtering and sorting */}
        <UserListClient 
          initialUsers={rows.map(u => ({
            id: u.id,
            email: u.email || '',
            created_at: u.created_at,
            user_metadata: u.user_metadata || {},
            profile: profilesMap[u.id] || null,
            policyCount: policyCountMap[u.id] || 0
          }))}
        />
      </div>
    </Container>
  );
}
