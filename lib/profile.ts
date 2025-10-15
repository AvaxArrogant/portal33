import { supabaseServer } from "@/lib/supabase/server";
export type Role = "admin" | "subadmin" | "customer";

/**
 * Server-side profile fetch with graceful fallback to Auth metadata.
 * This prevents SSR routes from redirecting to /login when the profiles row
 * is missing or RLS blocks the select, as long as the user is authenticated.
 */
export async function getProfile() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // Try to load the profile row; if it's missing or blocked by RLS, fall back
  const { data: profile, error } = await sb
    .from("profiles")
    .select("id,email,name,role,first_name,last_name,dob,address")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Fallback to Auth metadata (mirrors /api/me behavior)
    const md = user.user_metadata ?? {};
    const metaRole = typeof md.role === "string" ? (md.role as Role) : "customer";

    // Lightweight server-side debug for local issues; safe to keep
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("getProfile: profile row not found; using auth metadata fallback", {
        userId: user.id,
        profileError: error?.message,
        metaRole,
      });
    }

    return {
      id: user.id,
      email: user.email ?? md.email ?? "",
      name: (md.name as string) || user.email?.split("@")[0] || "User",
      role: ["admin", "subadmin", "customer"].includes(metaRole) ? metaRole : "customer",
      // Optional fields from metadata when available
      first_name: md.first_name as string | undefined,
      last_name: md.last_name as string | undefined,
      dob: md.dob as string | undefined,
      address: md.address as string | undefined,
    } satisfies { id: string; email: string; name: string; role: Role; address?: string; dob?: string; first_name?: string; last_name?: string };
  }

  // Merge Supabase profile with any additional metadata
  return {
    ...profile,
    ...user.user_metadata,
  } as { id: string; email: string; name: string; role: Role; address?: string; dob?: string; first_name?: string; last_name?: string };
}
