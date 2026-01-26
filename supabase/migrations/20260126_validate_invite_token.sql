-- Migration: Add validate_invite_token RPC
-- Date: 2026-01-26
-- Purpose: Allow unauthenticated users to validate invite tokens securely bypass RLS

CREATE OR REPLACE FUNCTION validate_invite_token(token_input text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', i.id,
        'token', i.token,
        'role', i.role,
        'client_id', i.client_id,
        'used_at', i.used_at,
        'expires_at', i.expires_at,
        'invited_by', i.invited_by,
        'client', jsonb_build_object('name', c.name)
    )
    INTO result
    FROM public.invitations i
    LEFT JOIN public.clients c ON c.id = i.client_id
    WHERE i.token = token_input
    AND i.used_at IS NULL
    AND i.expires_at > now();

    -- Return null if no match found (standard behavior for INTO with no rows is null result variable? No, it raises strict_multi_assignment or leaves it null)
    -- Actually `SELECT ... INTO` leaves variables unchanged if no rows found in PL/pgSQL?
    -- No, if no row is found, `result` will be null if we initialize it to null.
    -- Better safely:
    
    IF result IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN result;
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION validate_invite_token(text) TO anon, authenticated, service_role;
