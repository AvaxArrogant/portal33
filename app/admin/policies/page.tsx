import Container from "@/components/Container";
import Link from "next/link";
import Badge from "@/components/Badge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function AdminPoliciesPage() {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    redirect("/login");
  }

  const admin = supabaseAdmin();
  let query = admin
    .from("policies")
    .select("*, profile:profiles(email)")
    .order("start_date", { ascending: false });

  if (me.role === "subadmin") {
    query = query.eq("created_by", me.id);
  }

  const { data: policies, error } = await query;

  if (error) {
    return (
      <Container>
        <div className="py-20">Error: {error.message}</div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">All Policies</h1>
      <div className="space-y-5">
        {(policies || []).map((p: any) => (
          <Link
            key={p.id}
            href={`/policies/${p.id}`}
            className="block card p-5 hover:bg-ink-50"
          >
            <div className="flex items-center justify-between">
              <div className="text-ink-500">{p.number}</div>
              <Badge tone="grey">{String(p.status).toUpperCase()}</Badge>
            </div>
            <div className="mt-2 font-extrabold">{p.vehicle?.makeModel}</div>
            <div className="mt-2 text-ink-600 text-sm">
              Assigned to: {p.profile?.email ?? "Unassigned"}
            </div>
            <div className="mt-2 text-ink-600 text-sm">
              <span className="mr-6">
                Start {new Date(p.start_date).toLocaleDateString("en-GB")}
              </span>
              <span>
                End {new Date(p.end_date).toLocaleDateString("en-GB")}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/admin" className="underline">
          Back to Dashboard
        </Link>
      </div>
    </Container>
  );
}