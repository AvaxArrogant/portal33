import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic'

// Return ONLY customers that exist in the profiles table with rich details
// for better identification in the dropdown
export async function GET(request: Request) {
  const admin = supabaseAdmin();
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  
  try {
    console.log(`Customers API: Fetching profiles from database${status ? ` with status=${status}` : ''}`);
    
    // First, get all profiles with role=customer
    let query = admin
      .from("profiles")
      .select(`
        id,
        name,
        email,
        first_name,
        last_name,
        phone,
        role
      `)
      .eq("role", "customer")
      .order("created_at", { ascending: false });
    
    let { data: profiles, error } = await query;

    if (error) {
      console.error("Profiles API error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
    
    // If status filter is provided, we need to check auth metadata
    if (status && profiles && profiles.length > 0) {
      // Get auth users to check statuses
      const { data: { users }, error: authError } = await admin.auth.admin.listUsers();
      if (authError) {
        console.error("Auth API error:", authError.message);
      } else if (users) {
        // Create a map of users by ID with their status
        const userStatusMap = users.reduce((map, user) => {
          map[user.id] = user.user_metadata?.status || 'pending';
          return map;
        }, {} as Record<string, string>);
        
        // Filter profiles by status if requested
        if (status) {
          profiles = profiles.filter(p => userStatusMap[p.id] === status);
          console.log(`Filtered to ${profiles.length} customers with status=${status}`);
        }
      }
    }
    
    console.log(`Customers API: Returning ${profiles?.length || 0} customer profiles`);
    
    // Create formatted customer options with rich information
    const customerOptions = (profiles || []).map((p: any) => {
      // Build a descriptive name for better identification
      const fullName = p.name || 
        (p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : null) || 
        p.email || 
        `Customer ${p.id.substring(0, 8)}`;
        
      // Add additional context (email or id) if not already in the name
      let displayName = fullName;
      if (!fullName.includes(p.email) && p.email) {
        displayName = `${fullName} (${p.email})`;
      }
      
      return {
        id: p.id,
        name: displayName,
        email: p.email,
        phone: p.phone,
        raw: {
          first_name: p.first_name,
          last_name: p.last_name
        }
      };
    });

    return NextResponse.json(customerOptions, { 
      headers: { 
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      } 
    });
  } catch (err) {
    console.error("Unexpected error in customers API:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Unknown error", 
      source: "customers_api" 
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}