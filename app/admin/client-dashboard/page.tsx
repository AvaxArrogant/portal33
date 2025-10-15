"use client";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch session info first
        const sessionRes = await fetch("/api/debug/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionInfo(sessionData);
          
          // If no session, throw error
          if (!sessionData?.hasSession) {
            throw new Error("No active session found");
          }
        }
        
        // Fetch the current user profile
        const profileRes = await fetch("/api/me");
        if (!profileRes.ok) {
          throw new Error(`Failed to fetch profile: ${profileRes.status}`);
        }
        const profileData = await profileRes.json();
        setProfile(profileData);
        
        // Verify admin role
        const role = profileData?.role || sessionInfo?.userRole;
        if (role !== 'admin') {
          throw new Error(`Insufficient permissions: ${role} (requires admin role)`);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (res.ok) {
        // Clear any local storage or session storage items
        try {
          localStorage.removeItem("supabase.auth.token");
          sessionStorage.clear();
        } catch (e) {
          console.error("Error clearing storage:", e);
        }
        
        // Redirect to login
        router.push("/login");
      } else {
        setError("Failed to logout. Status: " + res.status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Admin Dashboard...</h1>
          <div className="animate-pulse bg-gray-200 h-8 w-1/2 mx-auto rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-32 w-full mx-auto rounded"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Dashboard Error</h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
          <p className="mb-4">There was an error loading the admin dashboard. This could be due to:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Session expired or not logged in</li>
            <li>Insufficient permissions</li>
            <li>Server connection issues</li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Return to Login
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Retry
            </button>
            <Link 
              href="/admin/debug" 
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Debug Dashboard
            </Link>
          </div>
          
          {sessionInfo && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Session Diagnostics</h2>
              <div className="bg-gray-100 p-4 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-2 bg-white rounded shadow">
                    <span className="font-medium">Session Active:</span>
                    <span className={sessionInfo?.hasSession ? "text-green-600 ml-2 font-semibold" : "text-red-600 ml-2 font-semibold"}>
                      {sessionInfo?.hasSession ? "Yes ✓" : "No ✗"}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded shadow">
                    <span className="font-medium">User ID:</span>
                    <span className="ml-2 font-mono text-sm">{sessionInfo?.userId || "None"}</span>
                  </div>
                  <div className="p-2 bg-white rounded shadow">
                    <span className="font-medium">User Email:</span>
                    <span className="ml-2">{sessionInfo?.userEmail || "None"}</span>
                  </div>
                  <div className="p-2 bg-white rounded shadow">
                    <span className="font-medium">User Role:</span>
                    <span className="ml-2">{sessionInfo?.userRole || sessionInfo?.profileRole || "None"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard (Client Version)</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {profile?.name || profile?.email || "Admin"}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500">
          <p className="font-medium">This is a client-side fallback dashboard for troubleshooting.</p>
          <p>You should be able to access this page even if the server-side dashboard fails.</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Role:</span>
              <span className="ml-2">{profile?.role || sessionInfo?.userRole || "Unknown"}</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Email:</span>
              <span className="ml-2">{profile?.email || sessionInfo?.userEmail || "Unknown"}</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-800">ID:</span>
              <span className="ml-2 font-mono text-sm">{profile?.id || sessionInfo?.userId || "Unknown"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Link href="/admin/users" className="bg-blue-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-blue-700">
            Manage Users
          </Link>
          <Link href="/admin/policies" className="bg-green-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-green-700">
            Manage Policies
          </Link>
          <Link href="/admin/revenue" className="bg-amber-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-amber-700">
            View Revenue
          </Link>
          <Link href="/admin" className="bg-indigo-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-indigo-700">
            Main Admin Panel
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Link href="/admin/users/create" className="bg-purple-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-purple-700">
            Create User
          </Link>
          <Link href="/admin/policies/create" className="bg-teal-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-teal-700">
            Create Policy
          </Link>
          <Link href="/admin/users/create?role=subadmin" className="bg-yellow-500 text-black rounded-lg p-4 text-center font-semibold hover:bg-yellow-600">
            Create Sub-Admin
          </Link>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Debugging Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/debug" className="bg-gray-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-gray-700">
              Debug Dashboard
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white rounded-lg p-4 text-center font-semibold hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
        
        {sessionInfo && (
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Authentication Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Session Active:</span>
                      <span className={sessionInfo?.hasSession ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {sessionInfo?.hasSession ? "Yes ✓" : "No ✗"}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Profile Found:</span>
                      <span className={sessionInfo?.hasProfile ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {sessionInfo?.hasProfile ? "Yes ✓" : "No ✗"}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Session Expiry:</span>
                      <span className="text-sm">{sessionInfo?.sessionExpiry || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Detected Roles</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Auth Metadata Role:</span>
                      <span>{sessionInfo?.userRole || "None"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Profile Role:</span>
                      <span>{sessionInfo?.profileRole || "None"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-100 rounded">
                      <span>Effective Role:</span>
                      <span>{profile?.role || sessionInfo?.userRole || sessionInfo?.profileRole || "None"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
