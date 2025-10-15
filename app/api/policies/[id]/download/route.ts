import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
// Force Node.js runtime because this route uses fs/path and Node-only PDF processing
export const runtime = "nodejs";

// Lazy import pdf-lib inside the handler to avoid edge bundling/resolution issues
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { PDFDocument } = await import("pdf-lib");
  const me = await getProfile();
  if (!me) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: policy, error } = await admin
    .from("policies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !policy) {
    return new NextResponse("Policy not found", { status: 404 });
  }

  // Authorization check
  if (me.role === "customer" && policy.customer_id !== me.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const templatePath = path.join(process.cwd(), "policies", "Policy Certificate POL-xxxx.pdf");
    const pdfTemplateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    const form = pdfDoc.getForm();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", policy.customer_id)
      .single();
  
    if (profileError || !profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }
  
    const vehicle = policy.vehicle as { registration?: string; makeModel?: string };
  
    form.getTextField("Policy Number").setText(policy.number ?? "");
    form.getTextField("Policy Holder").setText(profile.name ?? "");
    form.getTextField("Vehicle Registration").setText(vehicle?.registration ?? "");
    form.getTextField("Make of Vehicle").setText(vehicle?.makeModel ?? "");
    form.getTextField("Start of Coverage").setText(new Date(policy.start_date).toLocaleDateString("en-GB"));
    form.getTextField("End of Coverage").setText(new Date(policy.end_date).toLocaleDateString("en-GB"));
    form.getTextField("Customer Name - 1").setText(profile.name ?? "");
    form.getTextField("Customer Name - 2").setText(profile.name ?? "");

    form.flatten();

    const pdfBytes = await pdfDoc.save();

    const headers = new Headers();
    headers.append("Content-Disposition", `attachment; filename="${policy.number}.pdf"`);
    headers.append("Content-Type", "application/pdf");

    return new NextResponse(Buffer.from(pdfBytes), { headers });
  } catch (e: any) {
    console.error(e);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}