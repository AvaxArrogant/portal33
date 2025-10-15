import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const me = await getProfile();
  if (!me || !["admin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get("id") || "");

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const url = new URL("/admin/users", `${proto}://${host}`);
  return NextResponse.redirect(url);
}