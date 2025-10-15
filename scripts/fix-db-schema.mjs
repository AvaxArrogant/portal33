import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Directly add the missing columns to the profiles table
async function main() {
  // Get Supabase credentials
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('Error: Missing Supabase URL or service role key');
    process.exit(1);
  }
  
  console.log('Connecting to Supabase...');
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    // Run a query to check if columns exist
    console.log('Checking current schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('profiles')
      .select('id, email, name, address, first_name, last_name, dob')
      .limit(1);
      
    if (schemaError) {
      console.log('Schema check error, will add missing columns:', schemaError.message);
      
      // Execute SQL to add address column if it doesn't exist
      const { error: addressError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address text"
      });
      
      if (addressError) {
        // If rpc method doesn't exist, try direct query
        console.log('Using direct SQL execution for address...');
        const { error: directAddressError } = await supabase.auth.admin.executeRawSQL(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' AND column_name = 'address'
            ) THEN
              ALTER TABLE profiles ADD COLUMN address text;
            END IF;
          END $$;
        `);
        
        if (directAddressError) {
          console.error('Failed to add address column:', directAddressError);
        } else {
          console.log('Address column added successfully');
        }
      } else {
        console.log('Address column added successfully');
      }
      
      // Add other missing columns
      const otherColumns = [
        { name: 'first_name', type: 'text' },
        { name: 'last_name', type: 'text' },
        { name: 'dob', type: 'date' }
      ];
      
      for (const col of otherColumns) {
        console.log(`Adding ${col.name} column if missing...`);
        
        const { error: colError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
        });
        
        if (colError) {
          console.log(`Using direct SQL execution for ${col.name}...`);
          const { error: directColError } = await supabase.auth.admin.executeRawSQL(`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = '${col.name}'
              ) THEN
                ALTER TABLE profiles ADD COLUMN ${col.name} ${col.type};
              END IF;
            END $$;
          `);
          
          if (directColError) {
            console.error(`Failed to add ${col.name} column:`, directColError);
          } else {
            console.log(`${col.name} column added successfully`);
          }
        } else {
          console.log(`${col.name} column added successfully`);
        }
      }
    } else {
      console.log('Current profiles schema:');
      const sampleRow = columns && columns.length > 0 ? columns[0] : {};
      console.log('Columns present:', Object.keys(sampleRow).join(', '));
      
      // Check for missing columns
      const expectedColumns = ['address', 'first_name', 'last_name', 'dob'];
      const missingColumns = expectedColumns.filter(col => !(col in sampleRow));
      
      if (missingColumns.length > 0) {
        console.log('Missing columns detected:', missingColumns.join(', '));
        console.log('Will attempt to add them...');
        
        for (const col of missingColumns) {
          const colType = col === 'dob' ? 'date' : 'text';
          console.log(`Adding missing column ${col}...`);
          
          try {
            await supabase.auth.admin.executeRawSQL(`
              ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col} ${colType}
            `);
            console.log(`${col} column added successfully`);
          } catch (err) {
            console.error(`Failed to add ${col} column:`, err);
          }
        }
      } else {
        console.log('All expected columns are present in the profiles table');
      }
    }
    
    // Verify after changes
    console.log('\nVerifying schema after updates...');
    const { data: updatedColumns, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, name, address, first_name, last_name, dob')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying schema:', verifyError);
    } else {
      const verifiedColumns = updatedColumns && updatedColumns.length > 0 
        ? Object.keys(updatedColumns[0]) 
        : [];
      console.log('Verified columns:', verifiedColumns.join(', '));
    }
    
    console.log('\nDone. The customers dropdown should now work correctly.');
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
