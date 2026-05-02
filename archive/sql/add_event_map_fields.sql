-- Add geographical mapping fields to the events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS map_icon_type TEXT,
ADD COLUMN IF NOT EXISTS is_mapped BOOLEAN DEFAULT false;

-- Add a comment explaining the icon types
COMMENT ON COLUMN events.map_icon_type IS 'Categories: workshop, photowalk, exhibition, contest';

-- (RLS policies are likely already inherited from the events table, but we can ensure it if needed)
