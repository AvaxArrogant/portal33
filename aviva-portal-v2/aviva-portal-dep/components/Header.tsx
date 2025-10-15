"use client";
import Link from "next/link";
import Container from "./Container";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const sb = supabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: profile } = await sb.from("profiles").select("role,email").eq("id", user.id).single();
        if (profile) {
          setMe({ email: profile.email, role: profile.role });
        }
      }
    };
    fetchUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className={`sticky top-0 z-40 ${scrolled ? "bg-white/90 backdrop-blur" : "bg-white"} border-b border-ink-100`}>
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/logo.png" alt="Aviva Logo" className="h-8 w-auto" />
          </Link>
          <nav className="flex gap-6 text-sm text-ink-700 items-center">
            {(me?.role === "admin" || me?.role === "subadmin") ? (
              <Link href="/admin/policies" className="hover:underline">Policies</Link>
            ) : (
              <Link href="/policies" className="hover:underline">Policies</Link>
            )}
            {(me?.role === "admin" || me?.role === "subadmin") && (
              <Link href="/admin" className="hover:underline">Dashboard</Link>
            )}
            {!me && <Link href="/login" className="hover:underline">Sign in</Link>}
            {me && <button onClick={logout} className="hover:underline">Sign out</button>}
          </nav>
        </div>
      </Container>
    </header>
  );
}
