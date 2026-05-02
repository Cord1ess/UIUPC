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

async function verify() {
  const { data: data } = await supabase.from('committees').select('id, member_name, image_url, year');
  
  const cloudinaryOnes = data.filter(m => (m.image_url || '').includes('cloudinary.com'));
  console.log('Sample Cloudinary URLs in DB:');
  cloudinaryOnes.slice(0, 5).forEach(m => {
    console.log(` - ${m.member_name}: ${m.image_url}`);
  });

  const driveOnes = data.filter(m => /^[a-zA-Z0-9_-]{25,}$/.test(m.image_url || ''));
  console.log('\nSample Drive IDs in DB:');
  driveOnes.slice(0, 5).forEach(m => {
    console.log(` - ${m.member_name}: ${m.image_url}`);
  });
}

verify().catch(console.error);
