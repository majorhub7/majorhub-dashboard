-- Migration: Secure Clients Table
-- Date: 2026-01-26
-- Purpose: Add ownership to clients and enable RLS

-- 1. Add created_by column
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- READ: View clients if you created them OR if you are assigned to them (via users.client_id)
CREATE POLICY "Users can view relevant clients" ON public.clients
FOR SELECT
USING (
    auth.uid() = created_by 
    OR 
    id = (
        SELECT client_id FROM public.users WHERE id = auth.uid()
    )
);

-- INSERT: Authenticated users can create clients (must set created_by to themselves)
CREATE POLICY "Users can create clients" ON public.clients
FOR INSERT
WITH CHECK (
    auth.uid() = created_by
);

-- UPDATE: Only owners (creators) can update
CREATE POLICY "Owners can update clients" ON public.clients
FOR UPDATE
USING (
    auth.uid() = created_by
);

-- DELETE: Only owners can delete
CREATE POLICY "Owners can delete clients" ON public.clients
FOR DELETE
USING (
    auth.uid() = created_by
);

-- 4. Backfill existing clients (Optional: assigning to a default admin or leaving null?
-- If left null, they become invisible to everyone except superadmins/service_role.
-- Since this is a dev/test env attempt, we can leave it or try to assign.
-- Let's leave it, assuming new tests will create new clients. 
-- OR: Update all existing clients to be owned by the current user if running manually, but we can't do that easily here.
