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

async function listAllTables() {
  // Since we can't easily query information_schema with anon key, 
  // we try common table names or check existing code references.
  const knownTables = [
    'exhibition_submissions', 'events', 'achievements', 'blog_posts', 'committees', 
    'members', 'payments', 'results', 'site_settings', 'hero_pool'
  ];
  
  for (const table of knownTables) {
    const { data, error } = await supabase.from(table).select('*').limit(0);
    if (!error) {
      console.log(`Table exists: ${table}`);
    }
  }
}

listAllTables().catch(console.error);
