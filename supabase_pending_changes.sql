-- Table: pending_changes
-- Stores proposed changes by non-core admins for approval by core admins

CREATE TABLE IF NOT EXISTS public.pending_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    target_table TEXT NOT NULL,
    target_id TEXT, -- Can be UUID or string depending on the table
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;

-- Policies for pending_changes
-- Core admins can read, approve, or reject any change
CREATE POLICY "Core admins can view all pending changes" 
    ON public.pending_changes FOR SELECT 
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email' AND admins.role = 'core'));

CREATE POLICY "Core admins can update pending changes" 
    ON public.pending_changes FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email' AND admins.role = 'core'));

-- Non-core admins can create pending changes
CREATE POLICY "Admins can create pending changes" 
    ON public.pending_changes FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'));

-- Non-core admins can view their own pending changes
CREATE POLICY "Admins can view their own pending changes" 
    ON public.pending_changes FOR SELECT 
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email' AND admins.id = pending_changes.requested_by));

-- Create an index to speed up pending queries
CREATE INDEX IF NOT EXISTS idx_pending_changes_status ON public.pending_changes(status);
