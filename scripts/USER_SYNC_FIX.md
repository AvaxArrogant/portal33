# User List Synchronization Issue

If the user dropdown on the policy creation page shows users that don't exist in the database, or is missing users that should be there, follow these steps to fix the issue:

## Immediate Fix

1. Run the sync-users-profiles script to ensure all Auth users have corresponding profiles:

```bash
node ./scripts/sync-users-profiles.mjs
```

This script will:
- Find all users in the Supabase Auth system
- Check which ones don't have corresponding profiles in the database
- Create profiles for those users

## Database Fix

If you prefer to fix this directly in the database, you can run the SQL script in the Supabase SQL Editor:

```sql
-- This section creates profiles for any auth users that don't have them
CREATE TEMPORARY TABLE temp_auth_users AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'first_name' as first_name,
    raw_user_meta_data->>'last_name' as last_name,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'dob' as dob,
    raw_user_meta_data->>'address' as address
FROM auth.users;

-- Insert profiles for users who don't have them
INSERT INTO public.profiles (id, email, name, first_name, last_name, role, dob, address)
SELECT 
    au.id,
    au.email,
    COALESCE(au.name, au.email, 'Customer ' || substring(au.id::text, 1, 8)),
    au.first_name,
    au.last_name,
    COALESCE(au.role, 'customer'),
    CASE WHEN au.dob ~ '^\d{4}-\d{2}-\d{2}$' THEN au.dob::date ELSE NULL END,
    au.address
FROM 
    temp_auth_users au
    LEFT JOIN public.profiles p ON au.id = p.id
WHERE 
    p.id IS NULL;
```

## Understanding the Issue

The issue occurs because:

1. Users are created in the Supabase Auth system
2. The policy creation page only shows users that have entries in the `profiles` table
3. Sometimes users in Auth don't get properly synced to the `profiles` table

The fix we've implemented:
- Modified the API to only show users that exist in the profiles table
- Created a sync script to ensure all Auth users have profiles
- Added SQL to the database migration scripts to fix this automatically

Remember that the app will only show users that exist in the `profiles` table, which ensures data integrity with the policy customer_id foreign key.
