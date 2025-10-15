import { supabaseServer } from "@/lib/supabase/server";
export type Role = "admin" | "subadmin" | "customer";
export async function getProfile() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb.from("profiles").select("id,email,name,role").eq("id", user.id).maybeSingle();

  if (!profile) return null;

  return {
    ...profile,
    ...user.user_metadata,
  } as { id: string; email: string; name: string; role: Role; address: string; dob: string };
}
