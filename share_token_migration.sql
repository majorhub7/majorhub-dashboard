-- Add share_token column to creative_goals
ALTER TABLE creative_goals 
ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_creative_goals_share_token ON creative_goals(share_token);

-- Enable RLS if not already enabled (optional, good practice)
-- ALTER TABLE creative_goals ENABLE ROW LEVEL SECURITY;

-- Add policy to allow public read access for goals that have a share_token
-- Note: Adjust 'public' to 'anon' or 'authenticated' based on your Supabase settings if needed.
-- We usually allow 'anon' for public links.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creative_goals' 
        AND policyname = 'Public read access via share_token'
    ) THEN
        CREATE POLICY "Public read access via share_token"
        ON creative_goals
        FOR SELECT
        TO anon, authenticated
        USING (share_token IS NOT NULL);
    END IF;
END
$$;
