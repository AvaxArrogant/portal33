# Scripts README

This folder contains quick test scripts to validate Supabase Auth + `profiles` + `policies` integration.

Files
- `test-create-user.mjs` — Creates a Supabase Auth test user and upserts a `profiles` row.
- `test-create-policy.mjs` — Creates a test policy. If `CUSTOMER_ID` is not provided it creates a test user first.
- `add-missing-columns.sql` — SQL script to add any missing columns to the profiles table.
- `add-columns.mjs` — Node script to execute the SQL and fix the database schema.
- `fix-db-schema.mjs` — Alternative schema fixing script with more detailed error handling.

Environment variables (required)
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (keep secret, only use server-side)

Optional env vars
- `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_USER_NAME` — for `test-create-user.mjs`
- `CUSTOMER_ID` — use existing Auth user id for `test-create-policy.mjs` (otherwise the script creates a test user)

Run (PowerShell)

Set required env vars for the session and run the scripts:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
# optional
$env:TEST_USER_EMAIL='test@example.com'; $env:TEST_USER_PASSWORD='Password123!'
node .\scripts\test-create-user.mjs
```

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
# optionally set CUSTOMER_ID to use an existing user
node .\scripts\test-create-policy.mjs
```

## Fixing Database Schema Issues

If you encounter errors like "Could not find the 'address' column of 'profiles' in the schema cache", run:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
node .\scripts\add-columns.mjs
```

This will add all missing columns to the profiles table, including:
- address
- phone
- dob
- first_name
- last_name
- city
- postal_code

What the scripts do
- `test-create-user.mjs` returns the created Auth user id and confirms a `profiles` upsert.
- `test-create-policy.mjs` ensures a `profiles` row exists for the chosen `customer_id` (or creates one), then inserts a `policies` row and prints the created policy.
- `add-columns.mjs` adds missing columns to the profiles table to fix schema-related errors.

Safety & notes
- These scripts use the Supabase service role key. Do not commit your keys to source control.
- Run them only from a trusted machine or CI environment.
- If you want assertions or automated checks, I can add a test runner that fails on unexpected results.

Troubleshooting
- "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY": set env vars correctly.
- FK errors inserting policies: ensure the schema from `supabase_schema.sql` is applied and `profiles` table exists.
- "Could not find the 'address' column": run the add-columns.mjs script to fix schema issues.

Next steps (optional)
- Add a small integration test that runs both scripts and validates responses.
- Convert scripts to TypeScript and add `npm run` tasks.
