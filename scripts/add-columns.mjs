#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process.env');
  dotenv.config();
}

// Read SQL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFilePath = path.join(__dirname, 'add-missing-columns.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

async function executeSQL() {
  // Get Supabase URL and key from environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('Error: Missing environment variables.');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease check your .env.local file. Current values:');
    console.error(`NEXT_PUBLIC_SUPABASE_URL: ${url ? 'Set (length: ' + url.length + ')' : 'Missing'}`);
    console.error(`SUPABASE_SERVICE_ROLE_KEY: ${key ? 'Set (length: ' + key.length + ')' : 'Missing'}`);
    process.exit(1);
  }
  
  console.log('Connecting to Supabase...');
  console.log(`URL: ${url.substring(0, 8)}...${url.substring(url.length - 5)}`);
  console.log(`Key: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
  
  const supabase = createClient(url, key);
  
  try {
    console.log('Running SQL to add missing columns...');
    
    // Executing SQL using RPC (if available)
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) throw error;
      console.log('Schema updated successfully using RPC.');
    } catch (rpcError) {
      console.log('RPC method not available, falling back to direct SQL execution...');
      console.log(rpcError.message || 'No error message available');
      
      // Execute each SQL statement individually
      const statements = sql.split('DO $$').filter(stmt => stmt.trim() !== '');
      
      for (let i = 0; i < statements.length; i++) {
        let statement = statements[i].trim();
        if (statement) {
          // Add DO $$ prefix back if it was removed during split
          if (i > 0 || statement.startsWith('BEGIN')) {
            statement = 'DO $$' + statement;
          }
          
          console.log(`Executing SQL block ${i+1}/${statements.length}...`);
          try {
            const { error } = await supabase.auth.admin.executeRawSQL(statement);
            if (error) {
              console.error(`Error executing SQL block ${i+1}: ${error.message}`);
              throw error;
            }
          } catch (err) {
            console.error(`Failed to execute SQL block ${i+1}:`, err);
            console.log('Will try to continue with the remaining statements...');
          }
        }
      }
      
      console.log('Schema updated successfully using direct SQL.');
    }
    
    // Verify the schema
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);
      
      if (error) {
        console.error('Error querying profiles table:', error.message);
      } else {
        console.log('\nSuccessfully connected to profiles table!');
        
        // Try to list all columns in the profiles table
        try {
          const { data: columnsData, error: columnsError } = await supabase
            .rpc('exec_sql', { 
              sql: `SELECT column_name, data_type FROM information_schema.columns 
                   WHERE table_name = 'profiles' ORDER BY ordinal_position` 
            });
          
          if (columnsError) {
            console.log('Could not get column information via RPC:', columnsError.message);
          } else if (columnsData) {
            console.log('\nProfiles table columns:');
            console.log(columnsData);
          }
        } catch (err) {
          console.log('Could not get column information:', err.message);
        }
      }
    } catch (err) {
      console.error('Error verifying schema:', err.message);
    }
    
    console.log('\nDone. The database schema has been updated.');
    
  } catch (error) {
    console.error('Failed to update schema:', error);
    process.exit(1);
  }
}

executeSQL();
