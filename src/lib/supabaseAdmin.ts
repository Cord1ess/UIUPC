import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This client has full bypass of RLS and should ONLY be used in Server Actions or API Routes
// We don't throw at module level to prevent total app failure if the key is missing in development
export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey) 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any;

if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin mutations will fail.');
}

