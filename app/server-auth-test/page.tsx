import { supabaseServer } from "@/lib/supabase/server";
import Container from "@/components/Container";
import Link from "next/link";

// This is a server component that directly fetches auth state without client-side code
export default async function ServerAuthTest() {
  let authStatus = "unknown";
  let error = null;
  let user = null;
  let session = null;
  let profile = null;
  
  try {
    const sb = supabaseServer();
    
    // Get session
    const { data: sessionData, error: sessionError } = await sb.auth.getSession();
    session = sessionData?.session;
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session) {
      authStatus = "unauthenticated";
    } else {
      // Get user
      const { data: { user: userData }, error: userError } = await sb.auth.getUser();
      
      if (userError) {
        throw new Error(`User error: ${userError.message}`);
      }
      
      if (!userData) {
        authStatus = "session-without-user";
      } else {
        user = userData;
        
        // Get profile
        const { data: profileData, error: profileError } = await sb.from("profiles")
          .select("id,email,name,role")
          .eq("id", userData.id)
          .maybeSingle();
          
        if (profileError) {
          throw new Error(`Profile error: ${profileError.message}`);
        }
        
        profile = profileData;
        authStatus = "authenticated";
      }
    }
  } catch (e) {
    authStatus = "error";
    error = e instanceof Error ? e.message : String(e);
  }
  
  return (
    <Container>
      <div className="py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Server Auth Test</h1>
        <p className="text-gray-500 mb-6">
          This page is a <strong>server component</strong> that tests authentication state directly on the server.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className={`py-3 px-4 rounded-lg font-semibold ${
              authStatus === "authenticated" 
                ? "bg-green-100 text-green-800" 
                : authStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {authStatus === "authenticated" 
                ? "✓ Authenticated" 
                : authStatus === "error"
                ? "✗ Error"
                : authStatus === "unauthenticated"
                ? "✗ Not Authenticated"
                : authStatus === "session-without-user"
                ? "⚠ Session exists but no user"
                : "? Unknown Status"}
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            {authStatus === "authenticated" ? (
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-20">Name:</span>
                  <span>{profile?.name || user?.user_metadata?.name || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Email:</span>
                  <span>{profile?.email || user?.email || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Role:</span>
                  <span className="capitalize">{profile?.role || user?.user_metadata?.role || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Source:</span>
                  <span>{profile ? "profile" : "auth"}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-500">
                No profile data available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Navigation Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/login" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700">
              Login Page
            </Link>
            <Link href="/admin" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700">
              Admin Dashboard
            </Link>
            <Link href="/auth-test" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
              Client Auth Test
            </Link>
            <Link href="/admin/debug" className="bg-yellow-600 text-white p-4 rounded-lg text-center hover:bg-yellow-700">
              Debug Dashboard
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Session Details</h2>
          {session ? (
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[300px]">
              {JSON.stringify({
                session: {
                  ...session,
                  access_token: session.access_token ? `${session.access_token.substring(0, 10)}...` : null,
                  refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 10)}...` : null,
                },
                user: user ? {
                  ...user,
                  user_metadata: user.user_metadata || {},
                  identities: user.identities ? user.identities.length : 0
                } : null,
                profile
              }, null, 2)}
            </pre>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-gray-500">
              No session available
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
