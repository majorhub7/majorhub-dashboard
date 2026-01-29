-- Add position column to creative_goals table
ALTER TABLE creative_goals ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing rows to have a default position based on creation order or ID
WITH numbered_goals AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at ASC) as rn
  FROM creative_goals
)
UPDATE creative_goals
SET position = numbered_goals.rn
FROM numbered_goals
WHERE creative_goals.id = numbered_goals.id;
