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

async function main(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key){
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
  }
  const admin = createClient(url, key);

  const timestamp = Date.now();
  const email = process.env.TEST_USER_EMAIL || `testuser+${timestamp}@example.com`;
  const password = process.env.TEST_USER_PASSWORD || `TestPass!${Math.floor(Math.random()*9000)+1000}`;
  const first_name = process.env.TEST_USER_FIRST_NAME || `Test${String(timestamp).slice(-4)}`;
  const last_name = process.env.TEST_USER_LAST_NAME || `User${String(timestamp).slice(-4)}`;
  const dob = process.env.TEST_USER_DOB || '1990-01-01';
  const name = `${first_name} ${last_name}`;

  try{
    const { data, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'customer', name, first_name, last_name, dob }
    });
    if(createErr){
      console.error('createUser error:', createErr);
      process.exit(1);
    }
    const user = data.user;
    console.log('Auth user created:', user.id, user.email);

  // Upsert profiles row with detailed fields
  const { error: upErr } = await admin.from('profiles').upsert({ id: user.id, email: user.email, name, first_name, last_name, dob, role: 'customer' });
    if(upErr){
      console.error('profiles upsert error:', upErr);
      process.exit(1);
    }
    console.log('Profile upserted for user:', user.id);
    console.log(JSON.stringify({ id: user.id, email: user.email, name }, null, 2));
  }catch(e){
    console.error(e);
    process.exit(1);
  }
}

main();
