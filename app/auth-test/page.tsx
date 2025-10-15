"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  
  useEffect(() => {
    async function checkAuth() {
      const responses: Record<string, any> = {};
      
      try {
        // Check /api/me endpoint
        const meResponse = await fetch("/api/me");
        const meData = await meResponse.json();
        responses["/api/me"] = {
          status: meResponse.status,
          data: meData
        };
        
        if (meResponse.ok) {
          setProfile(meData);
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
        
        // Check session endpoint
        const sessionResponse = await fetch("/api/debug/session");
        const sessionData = await sessionResponse.json();
        responses["/api/debug/session"] = {
          status: sessionResponse.status,
          data: sessionData
        };
        
        // Check status endpoint
        const statusResponse = await fetch("/api/debug/status");
        const statusData = await statusResponse.json();
        responses["/api/debug/status"] = {
          status: statusResponse.status,
          data: statusData
        };
        
        setApiResponses(responses);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setAuthStatus("unauthenticated");
      }
    }
    
    checkAuth();
  }, []);
  
  return (
    <Container>
      <div className="py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            {authStatus === "loading" ? (
              <div className="animate-pulse bg-gray-100 h-10 rounded"></div>
            ) : (
              <div className={`py-3 px-4 rounded-lg font-semibold ${
                authStatus === "authenticated" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {authStatus === "authenticated" 
                  ? "✓ Authenticated" 
                  : "✗ Not Authenticated"}
              </div>
            )}
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            {authStatus === "loading" ? (
              <div className="space-y-2">
                <div className="animate-pulse bg-gray-100 h-6 w-3/4 rounded"></div>
                <div className="animate-pulse bg-gray-100 h-6 w-1/2 rounded"></div>
                <div className="animate-pulse bg-gray-100 h-6 w-2/3 rounded"></div>
              </div>
            ) : authStatus === "authenticated" ? (
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-20">Name:</span>
                  <span>{profile?.name || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Email:</span>
                  <span>{profile?.email || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Role:</span>
                  <span className="capitalize">{profile?.role || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-20">Source:</span>
                  <span>{profile?._source || "N/A"}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-500">
                Not logged in
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
            <Link href="/admin/client-dashboard" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
              Client Dashboard
            </Link>
            <Link href="/admin/debug" className="bg-yellow-600 text-white p-4 rounded-lg text-center hover:bg-yellow-700">
              Debug Dashboard
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Response Details</h2>
          <div className="space-y-4">
            {Object.entries(apiResponses).map(([endpoint, response]) => (
              <div key={endpoint} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-mono text-sm mb-2">{endpoint}</h3>
                <div className="flex gap-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={response.status >= 200 && response.status < 300 ? "text-green-600" : "text-red-600"}>
                    {response.status}
                  </span>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[200px]">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
