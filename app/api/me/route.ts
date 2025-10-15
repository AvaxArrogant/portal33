import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const sb = supabaseServer();
  const { data: { user }, error: userError } = await sb.auth.getUser();
  
  // If we can't get a user, return detailed error
  if (!user) {
    return NextResponse.json({ 
      error: "Not authenticated", 
      message: "No user found in the current session",
      userError: userError?.message
    }, { status: 401 });
  }

  // Get the session info
  const { data: sessionData, error: sessionError } = await sb.auth.getSession();
  
  // Try to get the profile
  const { data: prof, error: profileError } = await sb.from("profiles")
    .select("id,email,name,role")
    .eq("id", user.id)
    .maybeSingle();
  
  // If no profile, but we have a user, return the user info with role from metadata
  if (!prof) {
    const userMetadata = user.user_metadata || {};
    const role = userMetadata.role || "customer";
    
    return NextResponse.json({ 
      id: user.id,
      email: user.email,
      name: userMetadata.name || user.email,
      role: role,
      _source: "auth",
      _metadata: userMetadata,
      _profileError: profileError?.message,
      _hasSession: !!sessionData?.session
    });
  }

  // If we have both user and profile, return the profile
  return NextResponse.json({ 
    ...prof,
    _source: "profile",
    _metadata: user.user_metadata,
    _hasSession: !!sessionData?.session
  });
}
