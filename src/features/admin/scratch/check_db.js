const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log("Checking tables...");
  
  const p = await supabase.from('portfolios').select('id').limit(1);
  console.log("Portfolios table:", p.error ? `ERR: ${p.error.message}` : "OK");

  const dp = await supabase.from('department_posts').select('id').limit(1);
  console.log("Dept Posts table:", dp.error ? `ERR: ${dp.error.message}` : "OK");

  const pw = await supabase.from('portfolio_works').select('id').limit(1);
  console.log("Portfolio Works table:", pw.error ? `ERR: ${pw.error.message}` : "OK");
}

check().catch(console.error);
