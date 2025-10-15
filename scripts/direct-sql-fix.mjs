// Direct SQL execution to add missing columns to profiles table
// This is a fallback script for when the main add-columns.mjs script doesn't work

// Alter table statement for each missing column
const alterTableStatements = [
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address text;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS phone text;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS dob date;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS first_name text;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS last_name text;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS city text;`,
  `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS postal_code text;`
];

async function main() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { default: dotenv } = await import('dotenv');
    const { readFileSync, existsSync } = await import('fs');
    const { resolve } = await import('path');
    
    // Load environment variables
    const envPath = resolve(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      console.log(`Loading environment from ${envPath}`);
      dotenv.config({ path: envPath });
    } else {
      dotenv.config();
    }
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Missing Supabase URL or key');
    }
    
    console.log(`Connecting to Supabase: ${url}`);
    const supabase = createClient(url, key);
    
    // Execute each ALTER TABLE statement individually
    for (const sql of alterTableStatements) {
      console.log(`Executing: ${sql}`);
      
      try {
        // Method 1: Using SQL function
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.log(`RPC method failed: ${error.message}`);
          
          // Method 2: Using raw SQL
          try {
            const { error: rawError } = await supabase.auth.admin.executeRawSQL(sql);
            if (rawError) {
              throw rawError;
            }
            console.log('Success with raw SQL');
          } catch (rawErr) {
            console.log(`Raw SQL failed: ${rawErr.message}`);
            
            // Method 3: Using database query
            try {
              await supabase.from('_dummy_').select('*');
              console.log('Connected to database, but could not execute SQL');
            } catch (dbErr) {
              console.log(`Database connection test failed: ${dbErr.message}`);
            }
          }
        } else {
          console.log('Success with RPC');
        }
      } catch (err) {
        console.error(`Failed to execute: ${err.message}`);
      }
    }
    
    // Verify by reading the profiles table
    try {
      const { data, error } = await supabase.from('profiles').select('id,email').limit(1);
      if (error) {
        console.error(`Could not read profiles table: ${error.message}`);
      } else {
        console.log(`Successfully read profiles table, found ${data.length} row(s)`);
      }
    } catch (err) {
      console.error(`Failed to verify: ${err.message}`);
    }
    
    console.log('Script completed');
  } catch (err) {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

main();
