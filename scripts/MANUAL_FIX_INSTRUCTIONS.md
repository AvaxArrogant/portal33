# Database Schema Fix Guide

Unfortunately, running the script locally didn't work due to API limitations. Here's how to fix the database schema:

## Option 1: Run SQL in Supabase Dashboard

1. Open your Supabase dashboard (https://app.supabase.com)
2. Go to your project: https://app.supabase.com/project/eqirsotdfjeegzngixym
3. Navigate to the SQL Editor tab
4. Open the file `scripts/run_in_supabase_dashboard.sql` from this project
5. Copy and paste the SQL into the Supabase SQL Editor
6. Click "Run" to execute the SQL statements

This will add all the missing columns to your profiles table, including the `address` column.

## Option 2: Use Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
# Export the SQL to a file
supabase db execute --project-ref eqirsotdfjeegzngixym -f scripts/run_in_supabase_dashboard.sql
```

## Verifying the Fix

After running the SQL, you can verify it worked by:

1. In the Supabase dashboard, go to the Table Editor
2. Select the "profiles" table
3. Check that the "address" column exists

Once the missing columns are added, the error "Could not find the 'address' column of 'profiles' in the schema cache" should be resolved, and the user dropdown on the policy creation page should display the correct users.

## Troubleshooting

If you continue to see issues:

1. Restart your Next.js development server (`npm run dev`)
2. Clear your browser cache
3. Make sure the API routes are using the updated schema
