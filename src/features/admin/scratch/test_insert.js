const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log("Testing insert into portfolios...");
  
  const testPayload = {
    full_name: "Test Member",
    slug: "test-member-" + Math.random().toString(36).substring(7),
    team_id: "design",
    bio: "Test bio"
  };

  const { data, error } = await supabase.from('portfolios').insert([testPayload]);
  
  if (error) {
    console.error("INSERT FAILED:", error.message);
  } else {
    console.log("INSERT SUCCESSFUL!");
  }
}

testInsert().catch(console.error);
