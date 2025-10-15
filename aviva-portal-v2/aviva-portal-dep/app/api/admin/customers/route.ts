import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = supabaseAdmin();
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers();

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const activeCustomers = users.filter((u: any) => u.user_metadata?.role === "customer" && u.user_metadata?.status === "active");

  const customerOptions = activeCustomers.map((c: any) => ({
    id: c.id,
    name: c.user_metadata.name || c.email,
  }));

  return NextResponse.json(customerOptions);
}