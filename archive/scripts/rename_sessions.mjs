import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function renameSessions() {
  console.log('--- Renaming Committee Sessions (Take 2) ---');
  
  // 1. Rename 2023 to 2024
  const { data: d1, error: e1 } = await supabase
    .from('committees')
    .update({ year: '2024' })
    .eq('year', '2023')
    .select();
    
  if (e1) console.error('Error 2023:', e1);
  else console.log(`Updated 2023 rows: ${d1?.length || 0}`);

  // 2. Rename 2025-2026 to 2026
  const { data: d2, error: e2 } = await supabase
    .from('committees')
    .update({ year: '2026' })
    .eq('year', '2025-2026')
    .select();

  if (e2) console.error('Error 2025-2026:', e2);
  else console.log(`Updated 2025-2026 rows: ${d2?.length || 0}`);

  console.log('--- Migration Complete ---');
}

renameSessions().catch(console.error);
