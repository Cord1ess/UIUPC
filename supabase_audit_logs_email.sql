-- Add admin_email column to audit_logs table
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS admin_email TEXT;

-- Update existing audit logs to have 'system' or pull from admins if possible
UPDATE public.audit_logs al
SET admin_email = a.email
FROM public.admins a
WHERE al.admin_id = a.id;

-- For any remaining nulls, set them to 'unknown'
UPDATE public.audit_logs 
SET admin_email = 'unknown' 
WHERE admin_email IS NULL;
