import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const policy_id = String(form.get("policy_id") || "");

  if (!policy_id) {
    return NextResponse.json({ error: "Missing policy ID" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("policies")
    .update({ customer_id: null })
    .eq("id", policy_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const url = req.headers.get("referer") || "/admin/users";
  return NextResponse.redirect(url);
}