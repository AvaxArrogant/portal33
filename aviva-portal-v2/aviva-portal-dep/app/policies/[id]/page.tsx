import Container from "@/components/Container";
import { supabaseServer } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import PolicyDetail from "@/components/PolicyDetail";

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  const me = await getProfile();
  if (!me) return <Container><div className="py-20">Unauthorized</div></Container>;

  const sb = supabaseServer();
  const { data: policy, error } = await sb.from("policies").select("*").eq("id", params.id).single();
  if (error) return <Container><div className="py-20">Error: {error.message}</div></Container>;
  if (!policy) return <Container><div className="py-20">Not found</div></Container>;

  // customer access check (RLS protects anyway)
  if (me.role === "customer" && policy.customer_id !== me.id) {
    return <Container><div className="py-20">Forbidden</div></Container>;
  }

  return <PolicyDetail policy={policy} me={me} />;
}
