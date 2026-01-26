-- Migration: Add User Trigger and Backfill
-- Date: 2026-01-26
-- Description: Adds a trigger to automatically create a public.users profile when a new auth user is created. Also backfills missing profiles.

-- 1. Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, access_level, is_onboarded)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Gestor'),
    COALESCE(new.raw_user_meta_data->>'access_level', 'MANAGER'),
    COALESCE((new.raw_user_meta_data->>'is_onboarded')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill missing profiles for existing users
INSERT INTO public.users (id, email, name, role, access_level, is_onboarded)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'Gestor'),
  COALESCE(raw_user_meta_data->>'access_level', 'MANAGER'),
  COALESCE((raw_user_meta_data->>'is_onboarded')::boolean, false)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
