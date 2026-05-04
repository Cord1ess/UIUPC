-- ==============================================================================
-- UIUPC SUPABASE SECURITY POLICIES (RLS)
-- Execute this script in your Supabase SQL Editor to secure your database.
-- ==============================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PUBLIC READ ACCESS (Allow anyone to view the data)
-- ==============================================================================

DROP POLICY IF EXISTS "Allow public read-only access to members" ON members;
CREATE POLICY "Allow public read-only access to members"
ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to committees" ON committees;
CREATE POLICY "Allow public read-only access to committees"
ON committees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to events" ON events;
CREATE POLICY "Allow public read-only access to events"
ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to exhibition submissions" ON exhibition_submissions;
CREATE POLICY "Allow public read-only access to exhibition submissions"
ON exhibition_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to gallery" ON gallery;
CREATE POLICY "Allow public read-only access to gallery"
ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to achievements" ON achievements;
CREATE POLICY "Allow public read-only access to achievements"
ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access to blog posts" ON blog_posts;
CREATE POLICY "Allow public read-only access to blog posts"
ON blog_posts FOR SELECT USING (true);

-- ==============================================================================
-- PUBLIC INSERT ACCESS (For public registration/submission forms)
-- ==============================================================================

DROP POLICY IF EXISTS "Allow public to insert membership request" ON members;
CREATE POLICY "Allow public to insert membership request"
ON members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to insert exhibition submissions" ON exhibition_submissions;
CREATE POLICY "Allow public to insert exhibition submissions"
ON exhibition_submissions FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- ADMIN WRITE ACCESS (Mutations require authentication)
-- ==============================================================================

DROP POLICY IF EXISTS "Allow authenticated users to update members" ON members;
CREATE POLICY "Allow authenticated users to update members"
ON members FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete members" ON members;
CREATE POLICY "Allow authenticated users to delete members"
ON members FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert/update/delete committees" ON committees;
CREATE POLICY "Allow authenticated users to insert/update/delete committees"
ON committees FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert/update/delete events" ON events;
CREATE POLICY "Allow authenticated users to insert/update/delete events"
ON events FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update exhibition_submissions" ON exhibition_submissions;
CREATE POLICY "Allow authenticated users to update exhibition_submissions"
ON exhibition_submissions FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete exhibition_submissions" ON exhibition_submissions;
CREATE POLICY "Allow authenticated users to delete exhibition_submissions"
ON exhibition_submissions FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert/update/delete gallery" ON gallery;
CREATE POLICY "Allow authenticated users to insert/update/delete gallery"
ON gallery FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert/update/delete achievements" ON achievements;
CREATE POLICY "Allow authenticated users to insert/update/delete achievements"
ON achievements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert/update/delete blog_posts" ON blog_posts;
CREATE POLICY "Allow authenticated users to insert/update/delete blog_posts"
ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- SUCCESS: Database is now secured.
-- ==============================================================================
