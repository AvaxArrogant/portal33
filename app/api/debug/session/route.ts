import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const sb = supabaseServer();

  // Server-side view of the session (reads cookies via createServerClient)
  const { data: sessionData, error: sessionErr } = await sb.auth.getSession();
  
  // Get the user if we have a session
  const { data: { user }, error: userError } = await sb.auth.getUser();
  
  // Get the user's profile from the database
  let profile = null;
  let profileError = null;
  
  if (user) {
    const { data, error } = await sb.from("profiles")
      .select("id,email,name,role")
      .eq("id", user.id)
      .maybeSingle();
    
    profile = data;
    profileError = error;
  }

  // Raw cookies sent with the request
  const cookies: Record<string, string> = {};
  for (const [name, cookie] of req.cookies) {
    cookies[name] = cookie.value;
  }

  return NextResponse.json({ 
    session: sessionData?.session ?? null, 
    sessionError: sessionErr?.message ?? null, 
    cookies,
    hasSession: !!sessionData?.session,
    sessionExpiry: sessionData?.session?.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : null,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.user_metadata?.role,
    hasProfile: !!profile,
    profileRole: profile?.role,
    profileData: profile,
    userError: userError?.message,
    profileError: profileError?.message,
    timestamp: new Date().toISOString()
  });
}
