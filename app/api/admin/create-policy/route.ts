import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const number = `POL-${String(Math.random()).slice(2, 8)}`;
  const status = String(form.get("status") || "active");
  const premium_gbp = Number(form.get("premium_gbp") || 0);
  const customer_id = String(form.get("customer_id") || "");
  const start_date = String(form.get("start_date") || "");
  const end_date = String(form.get("end_date") || "");

  const make = String(form.get("make") || "");
  const model = String(form.get("model") || "");
  const vehicle = {
    make,
    model,
    makeModel: `${make} ${model}`,
    year: Number(form.get("year") || 0),
    vin: String(form.get("vin") || ""),
    color: String(form.get("color") || ""),
    registration: String(form.get("registration") || "").toUpperCase(),
  };
  const specs = {
    topSpeedMph: Number(form.get("top_speed") || 0),
    powerBhp: Number(form.get("power") || 0),
    gearbox: String(form.get("gearbox") || ""),
  };
  const engine = {
    capacityCc: Number(form.get("engine_cc") || 0),
    cylinders: Number(form.get("cylinders") || 0),
    fuelType: String(form.get("fuel_type") || ""),
    consumption: String(form.get("consumption") || ""),
  };
  const mot = {
    expiry: String(form.get("mot_expiry") || ""),
    taxValidUntil: String(form.get("tax_valid_until") || ""),
  };
  const covers = String(form.get("covers") || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const addons = String(form.get("addons") || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  if (!number || !customer_id) {
    return NextResponse.json({ error: "Missing policy number or customer" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  // Ensure a profiles row exists for the selected customer_id. If the
  // Supabase Auth user exists but has no profile row, upsert one from
  // Auth metadata so the policies.customer_id FK does not fail.
  if (customer_id) {
    const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", customer_id).maybeSingle();
    if (!existingProfile) {
      const { data: { users }, error: usersError } = await admin.auth.admin.listUsers();
      if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
      const found = users.find((u: any) => u.id === customer_id);
      if (!found) return NextResponse.json({ error: "Customer not found" }, { status: 400 });
      const email = found.email || "";
      const name = found.user_metadata?.name || email || null;
      const role = found.user_metadata?.role || "customer";
      const { error: upErr } = await admin.from("profiles").upsert({ id: customer_id, email, name, role });
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
  }

  const { data, error } = await admin.from("policies").insert({
    number, status, premium_gbp, start_date, end_date,
    vehicle, specs, engine, mot, covers, addons,
    customer_id,
    created_by: me.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
