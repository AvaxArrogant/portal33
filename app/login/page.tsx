
"use client";
import { useState, useEffect } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { safeNavigate, isDev } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  
  // Check server status on load
  useEffect(() => {
    async function checkServerStatus() {
      try {
        const response = await fetch('/api/debug/status');
        if (response.ok) {
          console.log('Server is online');
          setServerStatus('online');
        } else {
          console.error('Server returned error:', response.status);
          setServerStatus('offline');
        }
      } catch (err) {
        console.error('Server status check failed:', err);
        setServerStatus('offline');
      }
    }
    
    checkServerStatus();
  }, []);
  
  // Effect to handle navigation after successful login
  useEffect(() => {
    if (loginSuccess && redirectUrl) {
      console.log('Login success effect triggered, redirecting to:', redirectUrl);
      
      // Try Next.js router navigation
      try {
        router.push(redirectUrl);
      } catch (e) {
        console.error('Next.js router navigation failed:', e);
      }
      
      // Fallback to direct location change
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);
    }
  }, [loginSuccess, redirectUrl, router]);
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let loginRes;
    const apiUrl = window.location.port ? 
      `/api/auth/login` : 
      `${window.location.origin}/api/auth/login`;
      
    console.log('Attempting login to:', apiUrl);
    
    try {
      loginRes = await fetch(apiUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ensure cookies from the response are accepted by the browser
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', loginRes.status);
    } catch (err) {
      console.error('Network/login request failed', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error during login: ${errorMessage}. 
      Please check if the server is running on port ${window.location.port || '3000'}.`);
      return;
    }

    if (loginRes.ok) {
      const payload = await loginRes.json();
      console.log('Login successful, payload:', payload);
      const { user } = payload;
      if (user) {
        console.log('User role:', user.role, 'typeof role:', typeof user.role);
        
        // Use a simpler approach to avoid extension issues
        let redirectTo = "/policies"; // default
        
        if (user.role === "admin") {
          redirectTo = "/admin";
        } else if (user.role === "subadmin") {
          redirectTo = "/subadmin";
        }
            
        console.log('Login successful, should redirect to:', redirectTo);
        
        // For admin users, use our new redirect handler
        if (user.role === "admin") {
          try {
            // Try using the redirect handler for a more robust approach
            window.location.href = "/admin/redirect?to=" + redirectTo;
            
            // As a fallback, try the static HTML approach after a short delay
            setTimeout(() => {
              window.location.href = "/admin-redirect.html";
            }, 500);
            
            return; // Exit early to prevent setting state on unmounted component
          } catch (e) {
            console.error('Redirect failed:', e);
            // Continue with the normal flow if the redirect fails
          }
        }
        
        // For other roles, just set the success state and redirect URL
        // The useEffect will handle the actual navigation
        setLoginSuccess(true);
        setRedirectUrl(redirectTo);
      } else {
        console.error('Login succeeded but no user in response', payload);
        setError("Could not retrieve user profile.");
      }
    } else {
      let bodyText = 'Invalid credentials';
      try { 
        bodyText = await loginRes.text(); 
        console.error('Login failed - Response body:', bodyText);
      } catch(e){
        console.error('Failed to read error response:', e);
      }
      console.error('Login failed', loginRes.status, bodyText);
      setError("Invalid credentials");
    }
  }
  return (
  <div className="bg-gold-50">
    <div className="container-pad py-10 max-w-xl">
      <div className="card p-8 bg-gold-50 border-gold-200">
        <h1 className="text-3xl font-extrabold mb-2">Welcome to Aviva!</h1>
        <p className="hint mb-6">Access your insurance policy portal.</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
          
          {serverStatus === 'offline' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Server Offline</p>
              <p>The API server appears to be offline or inaccessible. Make sure the Next.js server is running on port {window.location.port || '3000'}.</p>
            </div>
          )}
          
          {error && <div className="text-red-600">{error}</div>}
          {loginSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Login successful!</p>
              <p>Click one of the options below if you aren't redirected automatically:</p>
              <div className="flex flex-col gap-2 mt-2">
                <Button 
                  className="btn-gold w-full" 
                  onClick={() => window.location.href = redirectUrl}
                >
                  Go to Dashboard
                </Button>
                <a 
                  href="/admin/redirect?to=/admin" 
                  className="btn btn-outline w-full text-center py-2 bg-green-50"
                >
                  Use Redirect Handler
                </a>
                <a 
                  href="/admin" 
                  className="btn btn-outline w-full text-center py-2"
                >
                  Admin Dashboard Direct Link
                </a>
                <a 
                  href="/admin/client-dashboard" 
                  className="btn btn-outline w-full text-center py-2 bg-blue-100"
                >
                  Client-Side Dashboard (Fallback)
                </a>
                <a 
                  href="/admin/debug" 
                  className="btn btn-outline w-full text-center py-2 bg-yellow-100"
                >
                  Debug Dashboard
                </a>
              </div>
            </div>
          )}
          <Button className="btn-gold w-full" type="submit" disabled={serverStatus === 'offline'}>Sign in</Button>
          
          {isDev() && (
            <div className="mt-4 border-t border-gold-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Debug Tools (Dev Only):</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth-test" className="text-sm text-blue-600 hover:underline">
                  Auth Test
                </Link>
                <Link href="/server-auth-test" className="text-sm text-blue-600 hover:underline">
                  Server Auth Test
                </Link>
                <Link href="/admin/debug" className="text-sm text-blue-600 hover:underline">
                  Debug Dashboard
                </Link>
                <Link href="/admin/redirect?to=/admin" className="text-sm text-blue-600 hover:underline">
                  Redirect Handler
                </Link>
              </div>
            </div>
          )}
        </form>
        <div className="my-6 flex items-center gap-3"><div className="h-px bg-ink-200 flex-1" /><span className="text-ink-500 text-sm">or</span><div className="h-px bg-ink-200 flex-1" /></div>
        <div className="space-y-3"><Button className="btn-outline w-full flex items-center justify-center gap-2"><img src="/apple.png" alt="Apple Logo" className="h-8 w-auto" />  Sign in with Apple</Button><Button className="btn-outline w-full">G  Sign in with Google</Button></div>
        <div className="text-center mt-6 text-gold-700 font-medium">New here? Create an account</div>
      </div>
    </div>
  </div>);
}