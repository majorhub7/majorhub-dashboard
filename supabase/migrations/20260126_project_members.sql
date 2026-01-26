-- Migration: Create Project Member System
-- Date: 2026-01-26

-- 1. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('VIEWER', 'CONTRIBUTOR', 'ADMIN')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- 2. Create project_invite_codes table
-- Stores the 'Variables' that link to a specific project and role
CREATE TABLE IF NOT EXISTS public.project_invite_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    variable_code text NOT NULL, -- e.g. 'ADMIN', 'TEAM', 'DEV'
    role text NOT NULL CHECK (role IN ('VIEWER', 'CONTRIBUTOR', 'ADMIN')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(client_id, variable_code)
);

-- 3. Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invite_codes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for project_members
-- Managers can see all members
CREATE POLICY "Managers can see all project members"
    ON public.project_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.access_level = 'MANAGER'
        )
    );

-- Users can see members of projects they belong to
CREATE POLICY "Users can see members of their projects"
    ON public.project_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
        )
    );

-- 5. RLS Policies for project_invite_codes
-- Only managers can manage invite codes
CREATE POLICY "Managers can manage project invite codes"
    ON public.project_invite_codes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.access_level = 'MANAGER'
        )
    );

-- Allow public read for validation (needed for registration flow)
CREATE POLICY "Allow public read for invite code validation"
    ON public.project_invite_codes FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. RPC Function to join project by variable
-- Input: client_name (full) + '+' + variable_code (e.g. 'MajorHub+ADMIN')
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
BEGIN
    -- 1. Split the variable (e.g. 'MajorHub+ADMIN')
    IF position('+' in full_variable) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Formato de código inválido. Use NOME+VARIAVEL');
    END IF;

    v_client_name := split_part(full_variable, '+', 1);
    v_variable_part := split_part(full_variable, '+', 2);

    -- 2. Find the client and invite code
    SELECT pic.project_id, pic.role, pic.client_id INTO v_project_id, v_role, v_client_id
    FROM public.project_invite_codes pic
    JOIN public.clients c ON c.id = pic.client_id
    WHERE LOWER(c.name) = LOWER(v_client_name) 
    AND LOWER(pic.variable_code) = LOWER(v_variable_part);

    IF v_project_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de variável não encontrado para este cliente.');
    END IF;

    -- 3. Update user profile if info provided
    UPDATE public.users
    SET 
        client_id = COALESCE(users.client_id, v_client_id),
        whatsapp = COALESCE(user_whatsapp, users.whatsapp),
        name = COALESCE(user_name, users.name),
        avatar_url = COALESCE(user_avatar, users.avatar_url),
        access_level = 'CLIENT',
        is_onboarded = true
    WHERE id = v_user_id;

    -- 4. Add to project_members
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_user_id, v_role)
    ON CONFLICT (project_id, user_id) DO UPDATE 
    SET role = EXCLUDED.role;

    RETURN jsonb_build_object(
        'success', true, 
        'project_id', v_project_id,
        'role', v_role
    );
END;
$$;
