
"use client";
import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (loginRes.ok) {
      const { user } = await loginRes.json();
      if (user) {
        switch (user.role) {
          case "admin":
            window.location.href = "/admin";
            break;
          case "subadmin":
            window.location.href = "/subadmin";
            break;
          default:
            window.location.href = "/policies";
            break;
        }
      } else {
        setError("Could not retrieve user profile.");
      }
    } else {
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
          {error && <div className="text-red-600">{error}</div>}
          <Button className="btn-gold w-full" type="submit">Sign in</Button>
        </form>
        <div className="my-6 flex items-center gap-3"><div className="h-px bg-ink-200 flex-1" /><span className="text-ink-500 text-sm">or</span><div className="h-px bg-ink-200 flex-1" /></div>
        <div className="space-y-3"><Button className="btn-outline w-full flex items-center justify-center gap-2"><img src="/apple.png" alt="Apple Logo" className="h-8 w-auto" />  Sign in with Apple</Button><Button className="btn-outline w-full">G  Sign in with Google</Button></div>
        <div className="text-center mt-6 text-gold-700 font-medium">New here? Create an account</div>
      </div>
    </div>
  </div>);
}