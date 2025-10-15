import Container from "@/components/Container";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";
import { gbp } from "@/lib/format";

export default async function RevenuePage() {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    redirect("/login");
  }

  const admin = supabaseAdmin();
  const { data: policies, error } = await admin
    .from("policies")
    .select("number,premium_gbp,profile:profiles(email)")
    .order("start_date", { ascending: false });

  if (error) {
    return (
      <Container>
        <div className="py-20">Error: {error.message}</div>
      </Container>
    );
  }

  const totalRevenue = policies?.reduce((acc, p) => acc + (p.premium_gbp ?? 0), 0) ?? 0;

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Revenue Breakdown</h1>
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <div className="text-lg font-bold">{gbp(totalRevenue)}</div>
        </div>
        <div className="mt-4 space-y-2">
          {(policies || []).map((p: any) => (
            <div key={p.number} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.number}</div>
                <div className="text-sm text-ink-500">
                  {p.profile?.email ?? "Unassigned"}
                </div>
              </div>
              <div>{gbp(p.premium_gbp)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <Link href="/admin" className="underline">
          Back to Dashboard
        </Link>
      </div>
    </Container>
  );
}