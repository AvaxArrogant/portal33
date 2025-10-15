import { NextResponse } from "next/server";

export async function GET() {
  const policyTypes = [
    { id: "auto", name: "Auto Insurance" },
    { id: "home", name: "Home Insurance" },
    { id: "life", name: "Life Insurance" },
  ];
  return NextResponse.json(policyTypes);
}