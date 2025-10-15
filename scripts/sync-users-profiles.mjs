/**
 * This script ensures all Supabase Auth users have corresponding entries in the profiles table.
 * It's used to fix inconsistencies between Auth users and profiles.
 */

import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// If env vars are missing because this script is executed from the scripts/
// folder, attempt to load the project's .env.local or .env from the project root.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectEnvLocal = path.resolve(scriptDir, '..', '.env.local');
  const projectEnv = path.resolve(scriptDir, '..', '.env');
  if (fs.existsSync(projectEnvLocal)) {
    (await import('dotenv')).config({ path: projectEnvLocal });
  } else if (fs.existsSync(projectEnv)) {
    (await import('dotenv')).config({ path: projectEnv });
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
  }
  const admin = createClient(url, key);

  try {
    console.log('Fetching all users from Supabase Auth...');
    const { data: { users }, error: usersError } = await admin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users in Auth system`);
    
    console.log('Fetching all profiles from database...');
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      process.exit(1);
    }
    
    console.log(`Found ${profiles.length} profiles in database`);
    
    // Create a set of existing profile IDs for quick lookup
    const existingProfileIds = new Set(profiles.map(p => p.id));
    
    // Find users without corresponding profiles
    const usersWithoutProfiles = users.filter(u => !existingProfileIds.has(u.id));
    
    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);
    
    if (usersWithoutProfiles.length === 0) {
      console.log('All users have corresponding profiles. No action needed.');
      process.exit(0);
    }
    
    // Create profile entries for users that don't have them
    const profilesToUpsert = usersWithoutProfiles.map(u => ({
      id: u.id,
      email: u.email || '',
      name: u.user_metadata?.name || u.email || `User ${u.id.substring(0, 8)}`,
      first_name: u.user_metadata?.first_name || '',
      last_name: u.user_metadata?.last_name || '',
      role: u.user_metadata?.role || 'customer',
      dob: u.user_metadata?.dob || null,
      address: u.user_metadata?.address || null
    }));
    
    console.log('Creating profiles for users without them...');
    const { error: upsertError } = await admin
      .from('profiles')
      .upsert(profilesToUpsert);
      
    if (upsertError) {
      console.error('Error upserting profiles:', upsertError);
      process.exit(1);
    }
    
    console.log(`Successfully created ${profilesToUpsert.length} missing profiles`);
    
    // List the fixed users
    for (const user of usersWithoutProfiles) {
      console.log(`Created profile for: ${user.email} (${user.id})`);
    }
    
    console.log('Sync complete.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
