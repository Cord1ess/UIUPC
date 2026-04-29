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
const gasUrl = process.env.NEXT_PUBLIC_GAS_DRIVE;

async function fetchFromDrive(folderId = '') {
  const response = await fetch(`${gasUrl}?folderId=${folderId}`);
  return response.json();
}

async function mapDrive() {
  const { data: members } = await supabase.from('committees').select('id, member_name, image_url, year');
  const root = await fetchFromDrive();
  const committeeFolder = root.subfolders?.find(f => f.name.toLowerCase() === 'committee');
  const subfoldersRes = await fetchFromDrive(committeeFolder.id);
  const yearFolders = subfoldersRes.subfolders || [];
  
  const driveFiles = [];
  for (const yf of yearFolders) {
    const filesRes = await fetchFromDrive(yf.id);
    (filesRes.files || []).forEach(f => {
      driveFiles.push({ ...f, year: yf.name });
    });
  }

  const updates = [];
  const failures = [];

  for (const member of members) {
    const nameParts = member.member_name.toLowerCase().split(' ').filter(p => p.length > 2);
    const cloudinaryId = member.image_url?.split('/').pop()?.split('_')?.pop()?.split('.')?.[0]?.toLowerCase();

    // Aggressive match: any file that contains 2+ parts of the name OR the cloudinary ID
    const match = driveFiles.find(f => {
      const driveName = f.name.toLowerCase();
      if (cloudinaryId && driveName.includes(cloudinaryId)) return true;
      
      const matchedParts = nameParts.filter(p => driveName.includes(p));
      return matchedParts.length >= 1; // Even 1 part is probably a match for names like "Zobayer"
    });

    if (match) {
      updates.push(`UPDATE committees SET image_url = '${match.id}' WHERE id = '${member.id}'; -- ${member.member_name} (${member.year})`);
    } else {
      failures.push(`${member.member_name} (${member.year}) - Current URL: ${member.image_url}`);
    }
  }

  fs.writeFileSync('update_committee_images_v2.sql', updates.join('\n'));
  console.log(`Generated ${updates.length} updates in update_committee_images_v2.sql`);
  if (failures.length > 0) {
    console.log(`\nFailed to match ${failures.length} members:`);
    failures.forEach(f => console.log(f));
  }
}

mapDrive().catch(console.error);
