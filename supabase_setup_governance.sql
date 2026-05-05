-- ==============================================================================
-- UIUPC GOVERNANCE SETUP
-- Creates all necessary tables for auditing, settings, and approval workflows.
-- ==============================================================================

-- 1. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='admin_email') THEN
        ALTER TABLE public.audit_logs ADD COLUMN admin_email TEXT;
    END IF;
END $$;

-- 2. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was already created
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='description') THEN
        ALTER TABLE public.admin_settings ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='updated_at') THEN
        ALTER TABLE public.admin_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Seed default settings
INSERT INTO public.admin_settings (key, value, description)
VALUES 
    ('join_page_open', 'true', 'Allow new membership applications'),
    ('submissions_open', 'true', 'Allow exhibition photo submissions'),
    ('require_approvals', 'false', 'Enable 4-eyes principle for non-core admins')
ON CONFLICT (key) DO NOTHING;

-- 3. PENDING CHANGES TABLE
CREATE TABLE IF NOT EXISTS public.pending_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    target_table TEXT NOT NULL,
    target_id TEXT,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. ENABLE RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- AUDIT LOGS: Only admins can view
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- ADMIN SETTINGS: Public can read keys (except sensitive ones if any), Admins can manage
DROP POLICY IF EXISTS "Public can read non-sensitive settings" ON admin_settings;
CREATE POLICY "Public can read non-sensitive settings"
    ON admin_settings FOR SELECT
    USING (key != 'admin_password');

DROP POLICY IF EXISTS "Only admins can manage settings" ON admin_settings;
CREATE POLICY "Only admins can manage settings"
    ON admin_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- PENDING CHANGES: 
DROP POLICY IF EXISTS "Core admins can view all pending changes" ON public.pending_changes;
CREATE POLICY "Core admins can view all pending changes" 
    ON public.pending_changes FOR SELECT 
    USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'core'));

DROP POLICY IF EXISTS "Admins can create pending changes" ON public.pending_changes;
CREATE POLICY "Admins can create pending changes" 
    ON public.pending_changes FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view their own pending changes" ON public.pending_changes;
CREATE POLICY "Admins can view their own pending changes" 
    ON public.pending_changes FOR SELECT 
    USING (requested_by = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_changes_status ON public.pending_changes(status);
