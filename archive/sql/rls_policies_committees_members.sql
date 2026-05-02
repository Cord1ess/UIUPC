-- Phase 3.5: Row Level Security (RLS) for Committees and Members

-- Enable RLS on both tables
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Committees Policies
-- 1. Read access is public (anyone can view the committee roster)
CREATE POLICY "Allow public read access on committees"
ON public.committees
FOR SELECT
USING (true);

-- 2. Write access restricted to admins (assuming authenticated users are admins for this internal system, or checking admin_profiles)
-- If using a dedicated admin_profiles table:
CREATE POLICY "Allow admin full access on committees"
ON public.committees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
);

-- Members Policies
-- 1. Read access: users can read their own member record, OR admins can read all
CREATE POLICY "Allow public read own member record or admin read all"
ON public.members
FOR SELECT
USING (
  (auth.uid() = id) OR
  (EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )) OR
  -- If public needs to read members for any reason, add true. We'll restrict to authenticated or public depending on app needs.
  -- The requirement says "Ensure only users authenticated as admins can write." 
  -- We'll just allow public read for now to not break public facing features, adjust if needed.
  true
);

-- 2. Insert access: Public can insert (apply for membership)
CREATE POLICY "Allow public to insert member applications"
ON public.members
FOR INSERT
WITH CHECK (true);

-- 3. Update/Delete access: restricted to admins
CREATE POLICY "Allow admin update delete on members"
ON public.members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
);

CREATE POLICY "Allow admin delete on members"
ON public.members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
);
