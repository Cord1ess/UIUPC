/**
 * UIUPC V1 Data Backup Utility
 * This script pulls data from all v1 Google Apps Script endpoints and saves them as JSON.
 */
const fs = require('fs');
const path = require('path');

const SCRIPTS = {
  membership: process.env.NEXT_PUBLIC_GAS_MEMBERSHIP || process.env.NEXT_PUBLIC_GAS_JOIN,
  photos: process.env.NEXT_PUBLIC_GAS_PHOTOS,
  gallery: process.env.NEXT_PUBLIC_GAS_GALLERY,
  blog: process.env.NEXT_PUBLIC_GAS_BLOG,
  results: process.env.NEXT_PUBLIC_GAS_RESULTS,
  committee: process.env.NEXT_PUBLIC_GAS_COMMITTEE,
};

const ACTIONS = {
  membership: "getApplications",
  photos: "getSubmissions",
  gallery: "getGallery",
  blog: "getBlogPosts",
  results: "getAllResults",
  committee: "getCommittee",
};

const BACKUP_DIR = path.join(process.cwd(), 'backups', `v1_extraction_${new Date().toISOString().split('T')[0]}`);

async function backup() {
  console.log('🚀 Starting UIUPC v1 Data Extraction...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  for (const [key, url] of Object.entries(SCRIPTS)) {
    if (!url) {
      console.warn(`⚠️  Skipping ${key}: No URL found in .env`);
      continue;
    }

    console.log(`\n📦 Extracting ${key.toUpperCase()}...`);
    console.log(`🔗 URL: ${url.substring(0, 50)}...`);

    try {
      const response = await fetch(`${url}?action=${ACTIONS[key]}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      const data = result.data || result.submissions || result.posts || result.gallery || result.entries || [];
      
      if (Array.isArray(data)) {
        const filePath = path.join(BACKUP_DIR, `${key}_v1.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Success: Saved ${data.length} records to ${key}_v1.json`);
      } else {
        console.warn(`⚠️  Warning: ${key} returned non-array data. Check script.`);
        console.log('Response preview:', JSON.stringify(result).substring(0, 100));
      }
    } catch (error) {
      console.error(`❌ Failed to backup ${key}:`, error.message);
    }
  }

  console.log('\n✨ Extraction complete! Files are located in:', BACKUP_DIR);
}

// Run if this is the main module
if (require.main === module) {
  backup();
}
