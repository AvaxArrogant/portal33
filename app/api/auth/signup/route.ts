import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.json();
  const email = String(form.email || "");
  const password = String(form.password || "");
  const name = String(form.name || "");
  const first_name = String(form.first_name || "");
  const last_name = String(form.last_name || "");
  const address = String(form.address || "");
  const dob = String(form.dob || "");

  const make = String(form.make || "");
  const model = String(form.model || "");
  const year = Number(form.year || 0);
  const vin = String(form.vin || "");
  const color = String(form.color || "");
  const registration = String(form.registration || "").toUpperCase();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password, and name required" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 1) Create auth user
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  user_metadata: { role: "customer", name, first_name, last_name, status: "active", address, dob },
  });

  if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });

  const user = data.user!;

  // 2) Upsert profile row with role
  const { error: upErr } = await admin.from("profiles").upsert({
    id: user.id,
  email,
  name,
  first_name,
  last_name,
  dob: dob || null,
  address: address || null,
  role: "customer",
  });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

  // 3) Create a policy for the user
  if (make && model && year && vin && registration) {
    const vehicle = {
      make,
      model,
      makeModel: `${make} ${model}`,
      year,
      vin,
      color,
      registration,
    };

    const { error: policyErr } = await admin.from("policies").insert({
      number: `POL-${String(Math.random()).slice(2, 8)}`,
      status: "pending",
      premium_gbp: 0, // Premium can be calculated later
      start_date: new Date().toISOString(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      vehicle,
      customer_id: user.id,
    });

    if (policyErr) return NextResponse.json({ error: policyErr.message }, { status: 400 });
  }

  return NextResponse.json({ message: "User created successfully" });
}