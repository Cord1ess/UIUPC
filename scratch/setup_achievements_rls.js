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

async function setupRLS() {
  console.log("Setting up RLS for achievements...");
  
  // Note: These usually require a service role key or running in Supabase Dashboard SQL Editor
  const sql = `
    -- Enable RLS
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

    -- Allow Public View
    DROP POLICY IF EXISTS "Allow public view" ON achievements;
    CREATE POLICY "Allow public view" ON achievements FOR SELECT USING (true);

    -- Allow Admin Management (if using service role or authenticated)
    DROP POLICY IF EXISTS "Allow admin all" ON achievements;
    CREATE POLICY "Allow admin all" ON achievements FOR ALL USING (true);
  `;
  
  console.log("Please run the following SQL in your Supabase Dashboard SQL Editor for best results:");
  console.log(sql);
}

setupRLS();
