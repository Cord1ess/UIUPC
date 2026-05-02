import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Note: Using anon key, hope RLS allows or we need service key

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCommittee() {
  console.log("Updating Tanzim Hasan...");
  
  // 1. Move Tanzim Hasan to Visual Department and change designation
  const { data: tanzim, error: tError } = await supabase
    .from('committees')
    .update({ 
      department: 'Visual Department', 
      designation: 'Head of Visual' 
    })
    .ilike('member_name', '%Tanzim Hasan%')
    .eq('year', '2026')
    .select();

  if (tError) console.error("Error updating Tanzim:", tError);
  else console.log("Updated Tanzim:", tanzim);

  // 2. Renaming "Visual Department" to "Design" or vice versa if needed
  // User said: "make Visual Department just like design"
  // This could mean rename "Visual Department" -> "Design"
  // OR it could mean they want "Visual Department" to be the name.
  // Given "change Tanzim Hasan Designation to Head of Visual move him from Event team" (to Visual),
  // I will assume they want the department name to be "Visual Department" consistently.
  
  console.log("Syncing department names...");
  const { data: vDept, error: vError } = await supabase
    .from('committees')
    .update({ department: 'Visual Department' })
    .eq('year', '2026')
    .eq('department', 'Visual Team'); // If it was called Visual Team

  if (vError) console.error("Error syncing depts:", vError);
  else console.log("Sync result:", vDept);
}

updateCommittee();
