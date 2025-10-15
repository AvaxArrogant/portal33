import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local if not present in environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const envLocalPath = path.resolve(scriptDir, '..', '.env.local');
  
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const envVars = envContent.split('\n');
    
    envVars.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service role key in environment variables');
  process.exit(1);
}

async function main() {
  try {
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Read the SQL file
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const sqlFilePath = path.resolve(scriptDir, 'add-missing-columns.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL to add missing columns...');
    
    // Execute the SQL using the Supabase client
    const { data, error } = await supabase.rpc('pgfunction', { 
      query: sqlContent 
    });

    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }

    console.log('SQL executed successfully!');
    console.log('Schema verification results:');
    console.table(data);
    
    console.log('\nNow checking profiles table data...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, role, address, first_name, last_name, dob')
      .limit(5);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log('Sample profiles data:');
      console.table(profiles);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
