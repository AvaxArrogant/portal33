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

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || '123456';
  const first_name = process.env.DEFAULT_ADMIN_FIRST_NAME || 'Admin';
  const last_name = process.env.DEFAULT_ADMIN_LAST_NAME || 'User';
  const name = `${first_name} ${last_name}`;
  const dob = process.env.DEFAULT_ADMIN_DOB || null;

  try{
    // Check if a user with this email already exists. If so, update them.
    const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
    if(listErr){
      console.error('listUsers error:', listErr);
      process.exit(1);
    }
    const existing = (listData && listData.users || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    let user;
    if(existing){
      console.log('User with email already exists in Auth, updating metadata and password:', email);
      const { data: updData, error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { role: 'admin', name, first_name, last_name, dob }
      });
      if(updErr){
        console.error('updateUserById error:', updErr);
        process.exit(1);
      }
      user = updData.user;
      console.log('Auth admin updated:', user.id, user.email);
    } else {
      const { data, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin', name, first_name, last_name, dob }
      });
      if(createErr){
        console.error('createUser error:', createErr);
        process.exit(1);
      }
      user = data.user;
      console.log('Auth admin created:', user.id, user.email);
    }

    // Upsert profiles row with admin role
    const { error: upErr } = await admin.from('profiles').upsert({ id: user.id, email: user.email, name, first_name, last_name, dob, role: 'admin' });
    if(upErr){
      console.error('profiles upsert error:', upErr);
      process.exit(1);
    }
    console.log('Admin profile upserted for user:', user.id);
    console.log(JSON.stringify({ id: user.id, email: user.email, name }, null, 2));
  }catch(e){
    console.error(e);
    process.exit(1);
  }
}

main();
