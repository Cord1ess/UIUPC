-- UIUPC Committee — Phase 4: Insert Missing & Historical Records
-- Run this in Supabase SQL Editor (Dashboard > SQL > New Query)
-- This bypasses RLS since SQL Editor runs as postgres role.
-- Generated: 2026-05-02

-- ═══════════════════════════════════════════════════════
-- SECTION 1: Insert 2 Missing 2024 Members
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Abdullah R Rafi', 'Executive', 'Computer Science & Engineering', '2024', 50, '1CvVGbFGYT4_Z4WBfYFoi7iDcEQCBsXl6', '{}'::jsonb),
  ('Md Fardin Jany', 'Executive', 'Computer Science & Engineering', '2024', 51, '1p0kpW9nKdMnKuMkyb0UpW4MDb39gpQsO', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- SECTION 2: Insert 2017 Committee (4 members)
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Jahid Hossain', 'President', NULL, '2017', 1, 'PLACEHOLDER', '{}'::jsonb),
  ('Saikat Kumar Saha', 'General Secretary', NULL, '2017', 2, 'PLACEHOLDER', '{}'::jsonb),
  ('M Shamim Reza', 'Asst. General Secretary', NULL, '2017', 3, 'PLACEHOLDER', '{}'::jsonb),
  ('S M Mushfiq Mahbub', 'Treasurer', NULL, '2017', 4, 'PLACEHOLDER', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- SECTION 3: Insert 2016 Committee (5 members)
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Saidur Rahman Shamrat', 'President', NULL, '2016', 1, 'PLACEHOLDER', '{}'::jsonb),
  ('Tariq Mahmud Naim', 'Vice President', NULL, '2016', 2, 'PLACEHOLDER', '{}'::jsonb),
  ('Sadi Mahmud Mahadi', 'General Secretary', NULL, '2016', 3, 'PLACEHOLDER', '{}'::jsonb),
  ('Jahid Hossain', 'Asst. General Secretary', NULL, '2016', 4, 'PLACEHOLDER', '{}'::jsonb),
  ('Kazi Asiful Alam', 'Treasurer', NULL, '2016', 5, 'PLACEHOLDER', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- SECTION 4: Insert 2015 Committee (6 members)
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Md. Rakibul Hasan', 'President', NULL, '2015', 1, 'PLACEHOLDER', '{}'::jsonb),
  ('Saidur Rahman Shamrat', 'Vice President', NULL, '2015', 2, 'PLACEHOLDER', '{}'::jsonb),
  ('Shihabul Arefin', 'General Secretary', NULL, '2015', 3, 'PLACEHOLDER', '{}'::jsonb),
  ('Fatema Tuz Zohra', 'Asst. General Secretary', NULL, '2015', 4, 'PLACEHOLDER', '{}'::jsonb),
  ('Tariq Mahmud Naim', 'Treasurer', NULL, '2015', 5, 'PLACEHOLDER', '{}'::jsonb),
  ('Sadi Mahmud Mahadi', 'Asst. Treasurer', NULL, '2015', 6, 'PLACEHOLDER', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- SECTION 5: Insert 2014 Committee (5 members)
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Saiful Arefin Hemel', 'President', NULL, '2014', 1, 'PLACEHOLDER', '{}'::jsonb),
  ('Kuntal Blaise D'' Costa', 'Vice President', NULL, '2014', 2, 'PLACEHOLDER', '{}'::jsonb),
  ('Md. Rakibul Hasan', 'General Secretary', NULL, '2014', 3, 'PLACEHOLDER', '{}'::jsonb),
  ('Saidur Rahman Shamrat', 'Asst. General Secretary', NULL, '2014', 4, 'PLACEHOLDER', '{}'::jsonb),
  ('Fatema Tuz Zohra', 'Treasurer', NULL, '2014', 5, 'PLACEHOLDER', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- SECTION 6: Insert 2013 Committee (6 members)
-- ═══════════════════════════════════════════════════════

INSERT INTO committees (member_name, designation, department, year, order_index, image_url, social_links)
VALUES
  ('Darshan Chakma', 'President', NULL, '2013', 1, 'PLACEHOLDER', '{}'::jsonb),
  ('Jubair Bin Iqbal', 'Vice President', NULL, '2013', 2, 'PLACEHOLDER', '{}'::jsonb),
  ('Saiful Arefin Hemel', 'General Secretary', NULL, '2013', 3, 'PLACEHOLDER', '{}'::jsonb),
  ('Saihan Rahman', 'Asst. General Secretary', NULL, '2013', 4, 'PLACEHOLDER', '{}'::jsonb),
  ('Kuntal Blaise D'' Costa', 'Treasurer', NULL, '2013', 5, 'PLACEHOLDER', '{}'::jsonb),
  ('Akifa Rahman Ondhi', 'Treasurer', NULL, '2013', 6, 'PLACEHOLDER', '{}'::jsonb);

-- ═══════════════════════════════════════════════════════
-- VERIFICATION: Check all years after running
-- ═══════════════════════════════════════════════════════

-- SELECT year, COUNT(*) as members FROM committees GROUP BY year ORDER BY year DESC;
