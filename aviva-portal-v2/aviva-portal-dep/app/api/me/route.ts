import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const { data: prof } = await sb.from("profiles").select("id,email,name,role").eq("id", user.id).maybeSingle();
  if (!prof) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: prof });
}
