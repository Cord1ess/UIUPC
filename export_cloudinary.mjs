import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// Load .env manually
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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const EXPORT_DIR = path.join(process.cwd(), 'Cloudinary_Export');

const hardcodedUrls = [
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121158/uiupc_HeroSlider2_cyl1xw.jpg", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526245/Artboard_2-100_woyw8v.jpg", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527954/Cover_mhro7f.jpg", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762799836/Blog5_lbkrue.png", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527923/Post_air114.jpg", folder: "Hero_Section" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526242/Artboard_1-100_u1jtvp.jpg", folder: "Events/Member_Recruitment_2026" },
  { url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763223291/Blog_7_suqqrn.jpg", folder: "Events/Shutter_Stories_Chapter_IV" }
];

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) {
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      console.error(`Error downloading ${url}: ${err.message}`);
      resolve(); // resolve anyway to continue
    });
  });
}

async function exportImages() {
  console.log("Starting Cloudinary Export...");

  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR);
  }

  // 1. Download Hardcoded Images
  console.log("\n[1/3] Downloading Hardcoded Images...");
  for (const item of hardcodedUrls) {
    const folderPath = path.join(EXPORT_DIR, item.folder);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    
    const fileName = item.url.split('/').pop();
    console.log(`Downloading: ${fileName}`);
    await downloadImage(item.url, path.join(folderPath, fileName));
  }

  // 2. Download from Supabase Events
  console.log("\n[2/3] Downloading Event Cover Photos from Supabase...");
  const { data: events } = await supabase.from('events').select('id, title, image_url, cover_image');
  if (events) {
    const eventsDir = path.join(EXPORT_DIR, 'Events_Database');
    if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

    for (const event of events) {
      const url = event.image_url || event.cover_image;
      if (url && url.includes('cloudinary.com')) {
        const fileName = url.split('/').pop();
        console.log(`Downloading Event: ${event.title}`);
        await downloadImage(url, path.join(eventsDir, `${event.title.replace(/[^a-z0-9]/gi, '_')}_${fileName}`));
      }
    }
  }

  // 3. Download from Supabase Submissions
  console.log("\n[3/3] Downloading Gallery/Exhibition Submissions from Supabase...");
  const { data: submissions } = await supabase.from('exhibition_submissions').select('id, photographer_name, photo_title, photo_url');
  if (submissions) {
    const subsDir = path.join(EXPORT_DIR, 'Exhibition_Submissions');
    if (!fs.existsSync(subsDir)) fs.mkdirSync(subsDir, { recursive: true });

    for (const sub of submissions) {
      if (sub.photo_url && sub.photo_url.includes('cloudinary.com')) {
        const fileName = sub.photo_url.split('/').pop();
        console.log(`Downloading Submission: ${sub.photographer_name} - ${sub.photo_title}`);
        const safeName = (sub.photographer_name || 'Unknown').replace(/[^a-z0-9]/gi, '_');
        await downloadImage(sub.photo_url, path.join(subsDir, `${safeName}_${fileName}`));
      }
    }
  }

  console.log("\n✅ Export Complete! All images have been downloaded to:");
  console.log(EXPORT_DIR);
}

exportImages().catch(console.error);
