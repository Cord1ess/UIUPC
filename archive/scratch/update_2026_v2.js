const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const table = 'committees';
const year = '2026';

async function request(method, path, data = null) {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const options = {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
         try {
           resolve(body ? JSON.parse(body) : null);
         } catch(e) { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log("Fetching all 2026 members...");
  const members = await request('GET', `${table}?year=eq.${year}`);
  
  if (!Array.isArray(members)) {
    console.error("Failed to fetch members:", members);
    return;
  }

  // 1. Rename Visual Department/Team to "Visual Department" for everyone
  console.log("Renaming departments...");
  for (const m of members) {
    if (m.department && (m.department.toLowerCase().includes('visual') || m.department.toLowerCase().includes('design'))) {
       const newDept = 'Visual Department'; // As requested
       if (m.department !== newDept) {
         await request('PATCH', `${table}?id=eq.${m.id}`, { department: newDept });
         console.log(`Updated ${m.member_name}: ${m.department} -> ${newDept}`);
       }
    }
  }

  // 2. Specific update for Tanzim Hasan
  const tanzim = members.find(m => m.member_name.toLowerCase().includes('tanzim'));
  if (tanzim) {
    console.log("Found Tanzim Hasan:", tanzim.member_name);
    await request('PATCH', `${table}?id=eq.${tanzim.id}`, {
      designation: 'Head of Visual',
      department: 'Visual Department'
    });
    console.log("Updated Tanzim Hasan's role.");
  } else {
    console.log("Tanzim Hasan not found in 2026 committee.");
  }

  console.log("Done.");
}

run();
