-- Migration: Allow public access to basic client info for invitations
-- Date: 2026-01-26

-- Function to get client name and logo without exposing other data
CREATE OR REPLACE FUNCTION public.get_client_public_info(client_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    logo_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypass RLS)
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.logo_url
    FROM public.clients c
    WHERE c.id = client_id;
END;
$$;

-- Grant access to anonymous users (for loading the invite page)
GRANT EXECUTE ON FUNCTION public.get_client_public_info(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_client_public_info(uuid) TO authenticated;
