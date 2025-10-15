import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const sb = supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No user found after login" }, { status: 500 });

  const { data: profile } = await sb.from("profiles").select("id,email,name,role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "No profile found for user" }, { status: 500 });

  return NextResponse.json({ user: profile });
}
