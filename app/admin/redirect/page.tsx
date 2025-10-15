"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";

function RedirectHandlerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [destination, setDestination] = useState<string>("");

  useEffect(() => {
    const dest = searchParams.get("to") || "/admin";
    setDestination(dest);

    async function checkSession() {
      try {
        const res = await fetch("/api/debug/session");
        if (res.ok) {
          const data = await res.json();
          setSessionInfo(data);
          if (data?.hasSession && (data?.userRole === "admin" || data?.profileRole === "admin")) {
            const timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  try {
                    window.location.href = dest;
                    router.push(dest);
                  } catch (e) {
                    console.error("Navigation error:", e);
                    setError(`Failed to navigate: ${e instanceof Error ? e.message : String(e)}`);
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
            return () => clearInterval(timer);
          } else {
            setError("No active admin session found");
          }
        } else {
          setError(`Failed to check session: ${res.status}`);
        }
      } catch (e) {
        setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    checkSession();
  }, [searchParams, router]);

  const handleManualRedirect = () => {
    try {
      window.location.href = destination;
    } catch (e) {
      setError(`Manual navigation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <Container>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Redirecting to Dashboard</h1>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Redirect Error</h2>
            <p className="mb-4">{error}</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Redirecting in {countdown} seconds</h2>
            <p className="mb-2">Destination: {destination}</p>
            <p>Please wait while we redirect you to the admin dashboard...</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button onClick={handleManualRedirect} className="bg-blue-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-blue-700">
            Go to Dashboard Now
          </button>
          <Link href="/admin/client-dashboard" className="bg-green-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-green-700">
            Client Dashboard
          </Link>
          <Link href="/admin/debug" className="bg-purple-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-purple-700">
            Debug Dashboard
          </Link>
          <Link href="/login" className="bg-gray-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-gray-700">
            Return to Login
          </Link>
        </div>
        {sessionInfo && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-3">Session Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Session Active:</span>
                <span className={sessionInfo?.hasSession ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {sessionInfo?.hasSession ? "Yes ✓" : "No ✗"}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">User Email:</span>
                <span className="font-mono">{sessionInfo?.userEmail || "N/A"}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">Role:</span>
                <span className="font-mono">{sessionInfo?.userRole || sessionInfo?.profileRole || "N/A"}</span>
              </div>
            </div>
          </div>
        )}
        <div className="text-sm text-gray-500">
          <p>If the automatic redirect doesn't work, please click the "Go to Dashboard Now" button above.</p>
          <p>If you continue to experience issues, try the Client Dashboard or Debug Dashboard links.</p>
        </div>
      </div>
    </Container>
  );
}

export default function RedirectHandler() {
  return (
    <Suspense fallback={<Container><div className="p-8">Preparing redirect…</div></Container>}>
      <RedirectHandlerInner />
    </Suspense>
  );
}
