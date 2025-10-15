import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const supabaseServer = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) {
          // Normalize cookie options so development (http://localhost) works
          const safeOptions = {
            path: options?.path ?? '/',
            sameSite: options?.sameSite ?? 'lax',
            secure: process.env.NODE_ENV === 'production' ? !!options?.secure : false,
            httpOnly: options?.httpOnly ?? true,
            expires: options?.expires,
            maxAge: options?.maxAge
          } as any;
          cookieStore.set({ name, value, ...safeOptions });
        },
        remove(name: string, options: any) {
          const safeOptions = {
            path: options?.path ?? '/',
            sameSite: options?.sameSite ?? 'lax',
            secure: process.env.NODE_ENV === 'production' ? !!options?.secure : false,
            httpOnly: options?.httpOnly ?? true,
            expires: options?.expires,
            maxAge: options?.maxAge
          } as any;
          // To remove, set an empty value and expiry
          cookieStore.set({ name, value: "", ...safeOptions });
        }
      }
    }
  );
};
