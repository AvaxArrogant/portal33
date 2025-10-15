import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    method: 'POST'
  });
}

export async function GET(req: NextRequest) {
  // Check Supabase connection
  let dbStatus = "unknown";
  let dbError = null;
  let authStatus = "unknown";
  let authError = null;
  
  try {
    const sb = supabaseServer();
    
    // Check database connectivity
    const { data: dbCheck, error: dbCheckError } = await sb.from("profiles").select("count").limit(1);
    dbStatus = dbCheckError ? "error" : "ok";
    dbError = dbCheckError?.message;
    
    // Check auth service
    const { data: authCheck, error: authCheckError } = await sb.auth.getSession();
    authStatus = authCheckError ? "error" : "ok";
    authError = authCheckError?.message;
  } catch (e) {
    dbStatus = "error";
    dbError = e instanceof Error ? e.message : String(e);
  }
  
  return NextResponse.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    method: 'GET',
    environment: process.env.NODE_ENV || "development",
    services: {
      database: {
        status: dbStatus,
        error: dbError
      },
      auth: {
        status: authStatus,
        error: authError
      }
    }
  });
}
