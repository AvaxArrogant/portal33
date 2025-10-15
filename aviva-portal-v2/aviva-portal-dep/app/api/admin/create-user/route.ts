import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const role = String(form.get("role") || "customer");
  const name = String(form.get("name") || "");
  const address = String(form.get("address") || "");
  const dob = String(form.get("dob") || "");

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password, and name required" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 1) Create auth user
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, name, status: "pending", address, dob, created_by: me.id },
  });
  if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });

  // 2) Upsert profile row with role
  const user = data.user!;
  const { error: upErr } = await admin.from("profiles").upsert({
    id: user.id,
    email,
    name,
    role,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const url = new URL("/admin/users", `${proto}://${host}`);
  return NextResponse.redirect(url);
}
