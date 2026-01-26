-- Migration: Allow Account-Level Invites (Project ID Nullable)
-- Date: 2026-01-26

-- 1. Make project_id nullable in project_invite_codes
ALTER TABLE public.project_invite_codes 
ALTER COLUMN project_id DROP NOT NULL;

-- 2. Update join_project_by_variable RPC to handle Account Invites
CREATE OR REPLACE FUNCTION join_project_by_variable(
    full_variable text,
    user_whatsapp text DEFAULT NULL,
    user_name text DEFAULT NULL,
    user_avatar text DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_name text;
    v_variable_part text;
    v_client_id uuid;
    v_project_id uuid;
    v_role text;
    v_user_id uuid := auth.uid();
    v_invite_found boolean;
BEGIN
    -- 1. Split the variable (e.g. 'MajorHub+ADMIN')
    IF position('+' in full_variable) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Formato de código inválido. Use NOME+VARIAVEL');
    END IF;

    v_client_name := split_part(full_variable, '+', 1);
    v_variable_part := split_part(full_variable, '+', 2);

    -- 2. Find the client and invite code
    -- We select into variables but also check if a row was actually found
    SELECT pic.project_id, pic.role, pic.client_id, true
    INTO v_project_id, v_role, v_client_id, v_invite_found
    FROM public.project_invite_codes pic
    JOIN public.clients c ON c.id = pic.client_id
    WHERE LOWER(c.name) = LOWER(v_client_name) 
    AND LOWER(pic.variable_code) = LOWER(v_variable_part);

    IF v_invite_found IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de variável não encontrado para este cliente.');
    END IF;

    -- 3. Update user profile
    UPDATE public.users
    SET 
        client_id = COALESCE(users.client_id, v_client_id),
        whatsapp = COALESCE(user_whatsapp, users.whatsapp),
        name = COALESCE(user_name, users.name),
        avatar_url = COALESCE(user_avatar, users.avatar_url),
        access_level = 'CLIENT', -- Force client level for invitees
        role = CASE WHEN v_role = 'ADMIN' THEN 'Gestor' ELSE 'Colaborador' END, -- Map role name nicely
        is_onboarded = true
    WHERE id = v_user_id;

    -- 4. Add to project_members ONLY IF project_id is present
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_members (project_id, user_id, role)
        VALUES (v_project_id, v_user_id, v_role)
        ON CONFLICT (project_id, user_id) DO UPDATE 
        SET role = EXCLUDED.role;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'project_id', v_project_id, -- Can be null
        'role', v_role
    );
END;
$$;
