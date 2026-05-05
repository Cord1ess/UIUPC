const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupExhibitionRLS() {
  console.log("Generating SQL for exhibition_submissions RLS...");
  
  const sql = `
    -- Enable RLS
    ALTER TABLE exhibition_submissions ENABLE ROW LEVEL SECURITY;

    -- Allow Public Submission (Insert Only)
    DROP POLICY IF EXISTS "Allow public submission" ON exhibition_submissions;
    CREATE POLICY "Allow public submission" ON exhibition_submissions FOR INSERT WITH CHECK (true);

    -- Allow Admins to manage everything
    DROP POLICY IF EXISTS "Allow admin all exhibition" ON exhibition_submissions;
    CREATE POLICY "Allow admin all exhibition" ON exhibition_submissions FOR ALL USING (true);
  `;
  
  console.log("--- SQL START ---");
  console.log(sql);
  console.log("--- SQL END ---");
  console.log("\nTIP: Run this SQL in your Supabase Dashboard SQL Editor.");
}

setupExhibitionRLS();
