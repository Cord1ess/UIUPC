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
  console.log("Starting missing Cloudinary Export...");

  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR);
  }

  // 1. Download from Committees
  console.log("\n[1/3] Downloading Committee Images...");
  const { data: committees, error: commError } = await supabase.from('committees').select('id, member_name, image_url, department');
  if (commError) console.error("Error fetching committees:", commError);
  if (committees) {
    const dir = path.join(EXPORT_DIR, 'Committees');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const member of committees) {
      const url = member.image_url;
      if (url && url.includes('cloudinary.com')) {
        const fileName = url.split('/').pop();
        console.log(`Downloading Member: ${member.member_name} from ${url}`);
        const safeName = (member.member_name || 'Unknown').replace(/[^a-z0-9]/gi, '_');
        await downloadImage(url, path.join(dir, `${safeName}_${fileName}`));
      } else {
        console.log(`Skipping member ${member.member_name} (URL: ${url})`);
      }
    }
  } else {
    console.log("No committee data returned.");
  }

  // 2. Download from Gallery
  // (Gallery is currently empty or does not have image_url column)

  // 3. Download from Blog Posts
  console.log("\n[3/3] Downloading Blog Post Images...");
  const { data: blogs, error: blogError } = await supabase.from('blog_posts').select('id, title, media');
  if (blogError) console.error("Error fetching blogs:", blogError);
  if (blogs) {
    const dir = path.join(EXPORT_DIR, 'Blog_Posts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const post of blogs) {
      if (Array.isArray(post.media)) {
        for (let i = 0; i < post.media.length; i++) {
          const mediaItem = post.media[i];
          if (mediaItem.type === 'image' && mediaItem.url && mediaItem.url.includes('cloudinary.com')) {
            const fileName = mediaItem.url.split('/').pop();
            console.log(`Downloading Blog Media: ${post.title}`);
            const safeTitle = (post.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
            await downloadImage(mediaItem.url, path.join(dir, `${safeTitle}_${i}_${fileName}`));
          }
        }
      }
    }
  }

  console.log("\n✅ Additional Export Complete! Images have been downloaded to:");
  console.log(EXPORT_DIR);
}

exportImages().catch(console.error);
