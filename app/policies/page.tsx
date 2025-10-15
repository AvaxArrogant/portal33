import Container from "@/components/Container";
import Link from "next/link";
import Badge from "@/components/Badge";
import { supabaseServer } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function PoliciesPage() {
  const me = await getProfile();
  console.log("User profile:", me); // Add this debug line
  
  if (!me) {
    return (
      <Container>
        <div className="py-20">
          Unauthorized. <a className="underline" href="/login">Login</a>
        </div>
      </Container>
    );
  }
  
  // Add more verbose role check
  console.log("User role:", me?.role);
  if (me.role === "admin") {
    console.log("Redirecting to admin dashboard");
    redirect("/admin");
  }
  if (me.role === "subadmin") redirect("/subadmin");

  const sb = supabaseServer();
  const { data: policies, error } = await sb
    .from("policies")
    .select("*")
    .eq("customer_id", me.id)
    .eq("status", "active")
    .order("start_date", { ascending: false });
  if (error) return <Container><div className="py-20">Error: {error.message}</div></Container>;

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Policies</h1>
      <div className="hint mb-6">{(policies?.length ?? 0) ? "Inactive policies" : ""}</div>
      <div className="space-y-5">
        {(policies || []).map((p:any)=>(
          <div key={p.id} className="card p-5">
            <Link href={`/policies/${p.id}`} className="block hover:bg-ink-50">
              <div className="flex items-center justify-between">
                <div className="text-ink-500">{p.number}</div>
                <Badge tone="grey">{String(p.status).toUpperCase()}</Badge>
              </div>
              <div className="mt-2 font-extrabold">{p.vehicle?.makeModel}</div>
              <div className="mt-2 text-ink-600 text-sm">
                <span className="mr-6">Start {new Date(p.start_date).toLocaleDateString("en-GB")}</span>
                <span>End {new Date(p.end_date).toLocaleDateString("en-GB")}</span>
              </div>
            </Link>
            <div className="mt-4">
              <a href={`/api/policies/${p.id}/download`} className="btn btn-outline w-full">Download Policy</a>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
