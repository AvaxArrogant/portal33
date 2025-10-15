-- =============================================
-- PROFILES TABLE SCHEMA FIX
-- =============================================
-- This SQL script adds missing columns to the profiles table
-- Run this in the Supabase SQL Editor
-- =============================================

-- Add address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address text;
        RAISE NOTICE 'Added address column to profiles table';
    ELSE
        RAISE NOTICE 'address column already exists';
    END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone text;
        RAISE NOTICE 'Added phone column to profiles table';
    ELSE
        RAISE NOTICE 'phone column already exists';
    END IF;
END $$;

-- Add dob column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'dob'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dob date;
        RAISE NOTICE 'Added dob column to profiles table';
    ELSE
        RAISE NOTICE 'dob column already exists';
    END IF;
END $$;

-- Add first_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name text;
        RAISE NOTICE 'Added first_name column to profiles table';
    ELSE
        RAISE NOTICE 'first_name column already exists';
    END IF;
END $$;

-- Add last_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name text;
        RAISE NOTICE 'Added last_name column to profiles table';
    ELSE
        RAISE NOTICE 'last_name column already exists';
    END IF;
END $$;

-- Add city column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE profiles ADD COLUMN city text;
        RAISE NOTICE 'Added city column to profiles table';
    ELSE
        RAISE NOTICE 'city column already exists';
    END IF;
END $$;

-- Add postal_code column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN postal_code text;
        RAISE NOTICE 'Added postal_code column to profiles table';
    ELSE
        RAISE NOTICE 'postal_code column already exists';
    END IF;
END $$;

-- Show the current columns in the profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- =============================================
-- CUSTOMER POLICY COUNTS FUNCTION
-- =============================================
-- Create a function to get policy counts by customer

CREATE OR REPLACE FUNCTION get_customer_policy_counts()
RETURNS TABLE(customer_id uuid, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    policies.customer_id, 
    COUNT(policies.id)::bigint as count
  FROM 
    policies
  WHERE 
    policies.customer_id IS NOT NULL
  GROUP BY 
    policies.customer_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTH USERS TO PROFILES SYNC
-- =============================================
-- This section creates profiles for any auth users that don't have them
-- =============================================

-- First, create a temporary table of auth users
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

-- Count how many profiles were added
DO $$
DECLARE
    added_count integer;
BEGIN
    SELECT COUNT(*) INTO added_count FROM public.profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM temp_auth_users au WHERE au.id = p.id
    );
    
    RAISE NOTICE 'Added % profiles for existing auth users', added_count;
END $$;
