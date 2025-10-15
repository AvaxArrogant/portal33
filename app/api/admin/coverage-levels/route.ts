import { NextResponse } from "next/server";

export async function GET() {
  const coverageLevels = [
    { id: "basic", name: "Basic" },
    { id: "standard", name: "Standard" },
    { id: "premium", name: "Premium" },
  ];
  return NextResponse.json(coverageLevels);
}