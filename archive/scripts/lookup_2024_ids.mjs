import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  });
}

const gasUrl = process.env.NEXT_PUBLIC_GAS_DRIVE;

async function main() {
  const root = await (await fetch(`${gasUrl}?action=browse`)).json();
  const cf = root.subfolders.find(f => f.name.toLowerCase() === 'committee');
  const subs = await (await fetch(`${gasUrl}?action=browse&folderId=${cf.id}`)).json();
  const y2024 = subs.subfolders.find(f => f.name === '2024');
  const filesRes = await (await fetch(`${gasUrl}?action=browse&folderId=${y2024.id}`)).json();
  const files = filesRes.files || [];
  
  const targets = files.filter(f => {
    const n = f.name.toLowerCase();
    return n.includes('rafi') || n.includes('fardin');
  });
  
  console.log('Files matching Rafi or Fardin in 2024 folder:');
  targets.forEach(f => console.log(`  ${f.name} -> ${f.id}`));
}

main().catch(console.error);
