const https = require('https');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing ENV variables");
  process.exit(1);
}

const table = 'committees';
const year = '2026';

async function patchMember(namePart, data) {
  const url = `${supabaseUrl}/rest/v1/${table}?member_name=ilike.*${encodeURIComponent(namePart)}*&year=eq.${year}`;
  
  const options = {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log("Updating Tanzim Hasan...");
  try {
    const result = await patchMember('Tanzim Hasan', {
      designation: 'Head of Visual',
      department: 'Visual Department'
    });
    console.log("Update Success:", result);
  } catch (err) {
    console.error("Update failed:", err);
  }
}

run();
