"use client";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Link from "next/link";

interface DebugInfo {
  location: string;
  timestamp: string;
  localStorage: Record<string, string>;
  cookies: string;
  sessionStorage: Record<string, string>;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  profileStatus?: number;
  profile?: any;
  profileError?: string;
}

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    location: '',
    timestamp: '',
    localStorage: {},
    cookies: '',
    sessionStorage: {},
    userAgent: '',
    viewport: { width: 0, height: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to collect debug information
    async function collectDebugInfo() {
      const info: DebugInfo = {
        location: window.location.toString(),
        timestamp: new Date().toISOString(),
        localStorage: {},
        cookies: document.cookie,
        sessionStorage: {},
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      // Get localStorage data safely
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              info.localStorage[key] = value;
            }
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          info.localStorage = { error: e.message };
        } else {
          info.localStorage = { error: 'Unknown error' };
        }
      }
      
      // Get sessionStorage data safely
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            const value = sessionStorage.getItem(key);
            if (value) {
              info.sessionStorage[key] = value;
            }
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          info.sessionStorage = { error: e.message };
        } else {
          info.sessionStorage = { error: 'Unknown error' };
        }
      }
      
      // Try to fetch user profile
      try {
        const profileRes = await fetch('/api/me');
        info.profileStatus = profileRes.status;
        info.profile = await profileRes.json();
      } catch (e) {
        if (e instanceof Error) {
          info.profileError = e.message;
        } else {
          info.profileError = 'Unknown error';
        }
      }
      
      setDebugInfo(info);
      setLoading(false);
    }
    
    collectDebugInfo();
  }, []);

  return (
    <Container>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold">Admin Dashboard Debug Page</h1>
        <p className="mt-2 text-red-600">
          This page helps diagnose why the admin dashboard isn't loading properly.
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Navigation Options</h2>
            <div className="space-y-2">
              <Link href="/admin" className="block bg-blue-500 text-white p-2 rounded text-center">
                Try Admin Dashboard Again
              </Link>
              <Link href="/admin/client-dashboard" className="block bg-green-500 text-white p-2 rounded text-center">
                Try Client-Side Dashboard
              </Link>
              <Link href="/login" className="block bg-gray-500 text-white p-2 rounded text-center">
                Return to Login
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <p>Loading debug information...</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
              <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
