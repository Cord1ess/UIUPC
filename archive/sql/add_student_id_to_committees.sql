-- Step 1: Add student_id column to committees
ALTER TABLE committees
ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Step 2: Create an index for fast lookups
CREATE INDEX IF NOT EXISTS idx_committees_student_id
ON committees(student_id);
