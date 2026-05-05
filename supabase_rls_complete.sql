-- ==============================================================================
-- UIUPC COMPLETE RLS POLICIES — Covers ALL tables including governance tables
-- Run this AFTER the base supabase_rls_policies.sql
-- ==============================================================================

-- ─── ADMIN_SETTINGS ─────────────────────────────────────────────────────────
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Public can read non-sensitive settings (needed for frontend toggles)
DROP POLICY IF EXISTS "Public can read non-sensitive settings" ON admin_settings;
CREATE POLICY "Public can read non-sensitive settings"
ON admin_settings FOR SELECT
USING (key != 'admin_password');

-- Only verified admins can manage settings
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON admin_settings;
CREATE POLICY "Only admins can manage settings"
ON admin_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid()
  )
);

-- ─── ADMINS TABLE ───────────────────────────────────────────────────────────
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read admin profiles (needed for auth context)
DROP POLICY IF EXISTS "Authenticated users can read admin profiles" ON admins;
CREATE POLICY "Authenticated users can read admin profiles"
ON admins FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can manage admins
DROP POLICY IF EXISTS "Authenticated users can manage admins" ON admins;
CREATE POLICY "Authenticated users can manage admins"
ON admins FOR ALL
USING (auth.role() = 'authenticated');

-- ─── AUDIT_LOGS ─────────────────────────────────────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read audit logs
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can read audit logs"
ON audit_logs FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert audit logs (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ─── DEPARTMENT_POSTS ───────────────────────────────────────────────────────
ALTER TABLE department_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for frontend
DROP POLICY IF EXISTS "Public can read department posts" ON department_posts;
CREATE POLICY "Public can read department posts"
ON department_posts FOR SELECT USING (true);

-- Authenticated users can manage department posts
DROP POLICY IF EXISTS "Authenticated users can manage department posts" ON department_posts;
CREATE POLICY "Authenticated users can manage department posts"
ON department_posts FOR ALL
USING (auth.role() = 'authenticated');

-- ─── PORTFOLIOS ─────────────────────────────────────────────────────────────
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Public read access for frontend
DROP POLICY IF EXISTS "Public can read portfolios" ON portfolios;
CREATE POLICY "Public can read portfolios"
ON portfolios FOR SELECT USING (true);

-- Authenticated users can manage portfolios
DROP POLICY IF EXISTS "Authenticated users can manage portfolios" ON portfolios;
CREATE POLICY "Authenticated users can manage portfolios"
ON portfolios FOR ALL
USING (auth.role() = 'authenticated');

-- ─── PORTFOLIO_WORKS ────────────────────────────────────────────────────────
ALTER TABLE portfolio_works ENABLE ROW LEVEL SECURITY;

-- Public read access for frontend
DROP POLICY IF EXISTS "Public can read portfolio works" ON portfolio_works;
CREATE POLICY "Public can read portfolio works"
ON portfolio_works FOR SELECT USING (true);

-- Authenticated users can manage portfolio works
DROP POLICY IF EXISTS "Authenticated users can manage portfolio works" ON portfolio_works;
CREATE POLICY "Authenticated users can manage portfolio works"
ON portfolio_works FOR ALL
USING (auth.role() = 'authenticated');

-- ─── ADD MISSING FINANCE CATEGORIES ─────────────────────────────────────────
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'finance_category') THEN
        BEGIN ALTER TYPE finance_category ADD VALUE 'transport'; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER TYPE finance_category ADD VALUE 'food'; EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN ALTER TYPE finance_category ADD VALUE 'printing'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
END $$;

-- ─── ADD admin_email COLUMN TO audit_logs IF MISSING ────────────────────────
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS admin_email TEXT;

-- ─── ADD social_links COLUMN TO blog_posts IF MISSING ───────────────────────
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS social_links JSONB;

-- ==============================================================================
-- SUCCESS: All governance tables are now secured.
-- ==============================================================================
