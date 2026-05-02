-- 1. Update Tanzim Hasan: Set Designation and Department
UPDATE committees 
SET 
  designation = 'Head of Visual',
  department = 'Visual Department'
WHERE 
  member_name ILIKE '%Tanzim Hasan%' 
  AND year = '2026';

-- 2. Consolidate Department Names for 2026
-- Renaming 'Visual Team' or similar to 'Visual Department' if they exist
UPDATE committees
SET department = 'Visual Department'
WHERE 
  (department ILIKE '%Visual%' OR department ILIKE '%Visual Team%')
  AND year = '2026'
  AND department != 'Visual Department';

-- 3. Ensure "Visual Department" is the standard name (mapping it to "Design" behavior)
-- If the user wants it exactly like Design, we might also want to check the Design dept name
UPDATE committees
SET department = 'Design'
WHERE 
  (department ILIKE '%Design Team%' OR department ILIKE '%Graphics%')
  AND year = '2026'
  AND department != 'Design';
