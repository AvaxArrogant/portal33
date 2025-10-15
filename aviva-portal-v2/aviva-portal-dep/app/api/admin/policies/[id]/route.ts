import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getProfile();
  if (!me || !["admin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { error } = await admin.from("policies").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const url = new URL("/admin/policies", `${proto}://${host}`);
  return NextResponse.redirect(url);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const form = await req.formData();
  if (form.get("_method") === "delete") {
    return DELETE(req, { params });
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getProfile();
  if (!me || !["admin", "subadmin"].includes(me.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
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

  if (!customer_id) {
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("policies").update({
    status, premium_gbp, start_date, end_date,
    vehicle, specs, engine, mot, covers, addons,
    customer_id,
  }).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}