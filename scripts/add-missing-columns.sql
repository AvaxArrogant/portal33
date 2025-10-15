-- Add missing address column to profiles table if it doesn't exist
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
    END IF;
END $$;

-- Also ensure all other expected columns exist
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name text;
        RAISE NOTICE 'Added first_name column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name text;
        RAISE NOTICE 'Added last_name column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone text;
        RAISE NOTICE 'Added phone column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE profiles ADD COLUMN city text;
        RAISE NOTICE 'Added city column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN postal_code text;
        RAISE NOTICE 'Added postal_code column to profiles table';
    END IF;
END $$;

-- This query helps verify the profiles schema after changes
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
