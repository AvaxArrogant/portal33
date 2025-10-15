-- Supabase SQL Schema for Aviva Portal
-- This script creates tables and relationships for a fresh Supabase project

-- make sure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES TABLE
-- Stores metadata for Supabase Auth users. Primary key is the Auth user id.
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text,
    first_name text,
    last_name text,
    dob date,
    address text,
    role text CHECK (role IN ('admin', 'subadmin', 'customer')) NOT NULL DEFAULT 'customer',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- POLICIES TABLE
CREATE TABLE IF NOT EXISTS policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 'number' column is used throughout the app code
    number text UNIQUE NOT NULL,
    -- link to profile (Supabase Auth user id)
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    -- policy owner / customer reference (references Supabase Auth profile id)
    customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status text CHECK (status IN ('active', 'inactive', 'cancelled')) NOT NULL DEFAULT 'active',
    premium_gbp numeric,
    start_date date,
    end_date date,
    -- structured JSON fields used by the frontend/backend
    vehicle jsonb,
    specs jsonb,
    engine jsonb,
    mot jsonb,
    covers jsonb,
    addons jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- POLICY TYPES TABLE
CREATE TABLE IF NOT EXISTS policy_types (
    id serial PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text
);

-- COVERAGE LEVELS TABLE
CREATE TABLE IF NOT EXISTS coverage_levels (
    id serial PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    address text,
    created_at timestamp with time zone DEFAULT now()
);

-- (customer_id already included in policies definition above)

-- REVENUE TABLE
CREATE TABLE IF NOT EXISTS revenue (
    id serial PRIMARY KEY,
    policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    received_at timestamp with time zone DEFAULT now()
);

-- AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS audit_log (
    id serial PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_customer_id ON policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_revenue_policy_id ON revenue(policy_id);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- If the triggers already exist (from a previous run), drop them so this script is idempotent
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_policies ON public.policies;

CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_policies
BEFORE UPDATE ON policies
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- END OF SCHEMA
