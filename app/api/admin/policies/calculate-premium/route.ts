import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // In a real application, you would have logic here to calculate the premium
  // based on the policy details sent in the request body.
  // For this mock endpoint, we'll just return a random number.
  const premium = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
  return NextResponse.json({ premium });
}