-- ArchMen Database Setup Script
-- Run this in your Supabase SQL editor to fix the RLS policies

-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can create own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to automatically create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_status, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'free',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure RLS is enabled and policies are correct
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify all policies exist
DO $$
BEGIN
  -- Check if INSERT policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can create own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
  
  -- Check if SELECT policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
  
  -- Check if UPDATE policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)';
  END IF;
END $$;
