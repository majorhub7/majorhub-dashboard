-- Remove invite_code from projects and related functions
-- Reverts changes from 20260126_add_project_invite_code.sql

-- Drop the RPC function for public access
DROP FUNCTION IF EXISTS public.get_project_by_invite_code(text);

-- Drop the index
DROP INDEX IF EXISTS public.idx_projects_invite_code;

-- Drop the generator function
DROP FUNCTION IF EXISTS public.generate_project_invite_code();

-- Drop the column from projects
ALTER TABLE public.projects 
DROP COLUMN IF EXISTS invite_code;
