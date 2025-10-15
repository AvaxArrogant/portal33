import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get("id") || "");
  const role = String(form.get("role") || "customer");
  const status = String(form.get("status") || "pending");
  const name = String(form.get("name") || "");
  const address = String(form.get("address") || "");
  const dob = String(form.get("dob") || "");

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error: userErr } = await admin.auth.admin.updateUserById(id, {
    user_metadata: { role, status, name, address, dob },
  });
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 400 });

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ role, name })
    .eq("id", id);
  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 400 });

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const url = new URL("/admin/users", `${proto}://${host}`);
  return NextResponse.redirect(url);
}