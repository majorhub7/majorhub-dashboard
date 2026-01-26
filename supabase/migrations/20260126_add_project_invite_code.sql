-- Add invite_code to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_invite_code ON public.projects(invite_code);

-- Function to generate a random invite code (can be used as default or via trigger)
CREATE OR REPLACE FUNCTION generate_project_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$;

-- Populate existing projects with invite codes if they don't have one
UPDATE public.projects 
SET invite_code = generate_project_invite_code() 
WHERE invite_code IS NULL;

-- Make invite_code strictly unique after population (though the index handles this, good for potential constraints)
ALTER TABLE public.projects ALTER COLUMN invite_code TYPE text;

-- RPC Function for public access (SECURITY DEFINER to bypass RLS for non-authenticated users)
CREATE OR REPLACE FUNCTION get_project_by_invite_code(code text)
RETURNS TABLE (
  project_id uuid,
  project_title text,
  client_id uuid,
  client_name text,
  client_logo text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.title as project_title,
    c.id as client_id,
    c.name as client_name,
    c.logo_url as client_logo
  FROM public.projects p
  JOIN public.clients c ON c.id = p.client_id
  WHERE p.invite_code = code;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_project_by_invite_code(text) TO anon, authenticated, service_role;
