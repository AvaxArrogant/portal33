import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const sb = supabaseServer();
  const { data: signInData, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  // Ensure the server client writes the auth session cookies for SSR.
  // signInWithPassword returns a session object on success; set it explicitly so
  // the createServerClient can write the Set-Cookie headers using the Next.js
  // cookies() store provided in `supabaseServer()`.
  if (signInData && signInData.session) {
    const { access_token, refresh_token } = signInData.session;
    // setSession expects the token pair
    await sb.auth.setSession({ access_token, refresh_token });
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No user found after login" }, { status: 500 });

  const { data: profile } = await sb.from("profiles").select("id,email,name,role").eq("id", user.id).maybeSingle();
  
  // Prefer role from profiles table; fall back to role stored in Auth user_metadata.
  const fallbackRole = signInData?.user?.user_metadata?.role;
  
  // Ensure role is a valid string and matches one of our expected values
  let role = profile?.role ?? fallbackRole ?? 'customer';
  
  // Normalize role to ensure it's one of our valid values
  if (typeof role !== 'string' || !['admin', 'subadmin', 'customer'].includes(role)) {
    console.warn('Invalid role detected:', role);
    role = 'customer'; // Default to customer if invalid role
  }
  
  // Create user object with profile data or fallback to auth metadata
  const userProfile = profile || {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  };

  // Server-side debug info to help trace missing roles during local dev.
  // (Keep this lightweight; remove in production once verified.)
  // eslint-disable-next-line no-console
  console.log('login route:', { 
    userId: user.id, 
    profileRole: profile?.role, 
    metadataRole: signInData?.user?.user_metadata?.role, 
    finalRole: role,
    roleType: typeof role
  });

  // Create a new user object with the normalized role
  const returnedUser = { 
    ...userProfile, 
    role // This is now guaranteed to be a valid string
  };

  // Include the sign-in session in the response for troubleshooting whether
  // the server-side session exists and cookies were written.
  return NextResponse.json({ user: returnedUser, session: signInData?.session ?? null });
}
