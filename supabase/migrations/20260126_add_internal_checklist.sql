-- Migration: Add internal_checklist column to creative_goals
-- Purpose: Store internal checklist items for each creative goal
-- Date: 2026-01-26

-- Add internal_checklist column as JSONB with default empty array
ALTER TABLE creative_goals 
ADD COLUMN internal_checklist JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN creative_goals.internal_checklist IS 
'Stores internal checklist items as JSON array of {id: string, text: string, completed: boolean}';

-- Create index for better query performance (optional but recommended)
CREATE INDEX idx_creative_goals_internal_checklist ON creative_goals USING GIN (internal_checklist);
