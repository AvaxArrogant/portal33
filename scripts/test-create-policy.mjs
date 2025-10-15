import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

function randPolicyNumber(){
  return `POL-${String(Math.random()).slice(2,8)}`;
}

async function ensureProfile(admin, customer_id){
  // if customer_id provided, ensure a profiles row exists; if not present in Auth, throw
  const { data: existing } = await admin.from('profiles').select('id').eq('id', customer_id).maybeSingle();
  if(existing) return existing.id;
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers();
  if(usersError) throw new Error(usersError.message);
  const found = users.find(u => u.id === customer_id);
  if(!found) throw new Error('Customer not found in Auth: ' + customer_id);
  const email = found.email || '';
  const name = found.user_metadata?.name || email || null;
  const role = found.user_metadata?.role || 'customer';
  const { error: upErr } = await admin.from('profiles').upsert({ id: customer_id, email, name, role });
  if(upErr) throw upErr;
  return customer_id;
}

async function createTestUser(admin){
  const timestamp = Date.now();
  const email = `policyuser+${timestamp}@example.com`;
  const password = `TestPass!${Math.floor(Math.random()*9000)+1000}`;
  const first_name = `Policy${String(timestamp).slice(-4)}`;
  const last_name = `User${String(timestamp).slice(-4)}`;
  const name = `${first_name} ${last_name}`;
  const dob = '1990-01-01';
  const { data, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'customer', name, first_name, last_name, dob } });
  if(createErr) throw createErr;
  const user = data.user;
  const { error: upErr } = await admin.from('profiles').upsert({ id: user.id, email: user.email, name, first_name, last_name, dob, role: 'customer' });
  if(upErr) throw upErr;
  return user.id;
}

async function main(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key){
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
  }
  const admin = createClient(url, key);

  let customerId = process.env.CUSTOMER_ID || null;
  try{
    if(!customerId){
      console.log('No CUSTOMER_ID provided; creating a test user...');
      customerId = await createTestUser(admin);
      console.log('Created test customer:', customerId);
    }else{
      console.log('Using CUSTOMER_ID from env:', customerId);
      await ensureProfile(admin, customerId);
    }

    const number = randPolicyNumber();
    const start_date = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setFullYear(end.getFullYear()+1);
    end.setDate(end.getDate()-1);
    const end_date = end.toISOString().split('T')[0];

    const vehicle = { make: 'TestMake', model: 'TestModel', makeModel: 'TestMake TestModel', year: 2020, vin: 'VINTEST123456', color: 'Blue', registration: 'TST123' };
    const specs = { topSpeedMph: 120, powerBhp: 200, gearbox: 'Manual' };
    const engine = { capacityCc: 1998, cylinders: 4, fuelType: 'Petrol', consumption: '30mpg' };
    const mot = { expiry: end_date, taxValidUntil: end_date };
    const covers = ['Comprehensive','Personal Accident'];
    const addons = ['Breakdown Cover'];

    const payload = {
      number,
      customer_id: customerId,
      created_by: customerId,
      status: 'active',
      premium_gbp: 750,
      start_date,
      end_date,
      vehicle,
      specs,
      engine,
      mot,
      covers,
      addons
    };

    const { data, error } = await admin.from('policies').insert(payload).select().single();
    if(error) throw error;
    console.log('Policy created:');
    console.log(JSON.stringify(data, null, 2));
  }catch(e){
    console.error('Error:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
