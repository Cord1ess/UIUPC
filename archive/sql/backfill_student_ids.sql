-- Phase 3: Data Backfill Script for student_id in committees
-- Run this in the Supabase SQL Editor

-- This query matches the 'member_name' in the 'committees' table
-- with the 'full_name' in the 'members' table and updates the 
-- 'student_id' in 'committees' where it is currently NULL.

UPDATE committees c
SET student_id = m.student_id
FROM members m
WHERE c.member_name ILIKE m.full_name
  AND c.student_id IS NULL;

-- Note: ILIKE is used for case-insensitive matching.
-- If there are members with identical names, this query might assign 
-- the student_id of the first match it finds. Review your data after running.
-- For exact matches, you can change ILIKE to =

-- To check how many records were updated or need updating:
-- SELECT id, member_name, student_id FROM committees WHERE student_id IS NULL;
