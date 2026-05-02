/**
 * fix_committee_data.mjs
 * Phase 4 — Historical Data & Image Integrity Pass
 *
 * Usage:
 *   node fix_committee_data.mjs               # Live run (writes to DB)
 *   node fix_committee_data.mjs --dry-run     # Preview only (no writes)
 *
 * What it does:
 *   1. Fixes swapped/wrong images for 2026 (30 members) and 2024 (24 members)
 *   2. Inserts 2 missing 2024 committee members (Abdullah R Rafi, Md Fardin Jany)
 *   3. Inserts 35 historical committee records (2013–2022)
 *   4. Matches Drive images by strict filename, year-scoped
 *   5. Falls back to 'PLACEHOLDER' when no image is found
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Load .env ────────────────────────────────────────────────────────
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
const gasUrl = process.env.NEXT_PUBLIC_GAS_DRIVE;

if (!supabaseUrl || !supabaseKey) { console.error('❌ Missing Supabase credentials in .env'); process.exit(1); }
if (!gasUrl) { console.error('❌ Missing NEXT_PUBLIC_GAS_DRIVE in .env'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('\n🔍 DRY RUN MODE — No database writes will be made.\n');

// ── Helper: Fetch from Drive GAS ─────────────────────────────────────
async function fetchFromDrive(folderId = '') {
  const url = `${gasUrl}?action=browse${folderId ? `&folderId=${folderId}` : ''}`;
  const response = await fetch(url);
  return response.json();
}

// ── Helper: Strict Name Matching ─────────────────────────────────────
// Common prefixes/titles to ignore during matching
const IGNORE_PARTS = new Set(['md', 'md.', 'sm', 'st', 's.m.', 'asst', 'asst.', 'the', 'dr', 'dr.']);

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[''`]/g, '')   // remove apostrophes
    .replace(/\.(jpg|jpeg|png|webp|heic|gif)$/i, '') // remove extensions
    .split(/[\s_\-\.]+/)
    .filter(p => p.length > 1 && !IGNORE_PARTS.has(p));
}

function strictMatch(memberName, driveFileName) {
  const memberParts = normalizeName(memberName);
  const driveParts = normalizeName(driveFileName);

  if (memberParts.length === 0 || driveParts.length === 0) return { matches: false, score: 0 };

  // Count how many member name parts appear in the drive filename
  const matchedParts = memberParts.filter(mp =>
    driveParts.some(dp => dp.includes(mp) || mp.includes(dp))
  );

  const score = matchedParts.length;
  // Require at least 2 parts to match, or 1 if name only has 1 significant part
  const threshold = memberParts.length <= 1 ? 1 : 2;

  return { matches: score >= threshold, score, memberParts: memberParts.length };
}

function findBestMatch(memberName, driveFiles) {
  let bestMatch = null;
  let bestScore = 0;

  for (const file of driveFiles) {
    const result = strictMatch(memberName, file.name);
    if (result.matches && result.score > bestScore) {
      bestScore = result.score;
      bestMatch = file;
    }
  }

  return bestMatch;
}

// ── Historical Committee Data ────────────────────────────────────────
const HISTORICAL_DATA = [
  // 2024 — Missing 2 members
  { member_name: 'Abdullah R Rafi', designation: 'Executive', department: 'Computer Science & Engineering', year: '2024', order_index: 50 },
  { member_name: 'Md Fardin Jany', designation: 'Executive', department: 'Computer Science & Engineering', year: '2024', order_index: 51 },

  // 2022
  { member_name: 'Arif Mahmud', designation: 'President', department: null, year: '2022', order_index: 1 },
  { member_name: 'Mirza Muyammar Munnaf Hussain Baig', designation: 'General Secretary', department: null, year: '2022', order_index: 2 },
  { member_name: 'Rabius Sany Jabiullah', designation: 'Treasurer', department: null, year: '2022', order_index: 3 },
  { member_name: 'Adib Mahmud', designation: 'Asst. Treasurer', department: null, year: '2022', order_index: 4 },

  // 2019
  { member_name: 'Saikat Kumar Saha', designation: 'President', department: null, year: '2019', order_index: 1 },
  { member_name: 'M Shamim Reza', designation: 'General Secretary', department: null, year: '2019', order_index: 2 },
  { member_name: 'S. M. Abu Hena', designation: 'Asst. General Secretary', department: null, year: '2019', order_index: 3 },
  { member_name: 'Mohiuzzaman', designation: 'Treasurer', department: null, year: '2019', order_index: 4 },
  { member_name: 'Sadia Islam', designation: 'Asst. Treasurer', department: null, year: '2019', order_index: 5 },

  // 2017
  { member_name: 'Jahid Hossain', designation: 'President', department: null, year: '2017', order_index: 1 },
  { member_name: 'Saikat Kumar Saha', designation: 'General Secretary', department: null, year: '2017', order_index: 2 },
  { member_name: 'M Shamim Reza', designation: 'Asst. General Secretary', department: null, year: '2017', order_index: 3 },
  { member_name: 'S M Mushfiq Mahbub', designation: 'Treasurer', department: null, year: '2017', order_index: 4 },

  // 2016
  { member_name: 'Saidur Rahman Shamrat', designation: 'President', department: null, year: '2016', order_index: 1 },
  { member_name: 'Tariq Mahmud Naim', designation: 'Vice President', department: null, year: '2016', order_index: 2 },
  { member_name: 'Sadi Mahmud Mahadi', designation: 'General Secretary', department: null, year: '2016', order_index: 3 },
  { member_name: 'Jahid Hossain', designation: 'Asst. General Secretary', department: null, year: '2016', order_index: 4 },
  { member_name: 'Kazi Asiful Alam', designation: 'Treasurer', department: null, year: '2016', order_index: 5 },

  // 2015
  { member_name: 'Md. Rakibul Hasan', designation: 'President', department: null, year: '2015', order_index: 1 },
  { member_name: 'Saidur Rahman Shamrat', designation: 'Vice President', department: null, year: '2015', order_index: 2 },
  { member_name: 'Shihabul Arefin', designation: 'General Secretary', department: null, year: '2015', order_index: 3 },
  { member_name: 'Fatema Tuz Zohra', designation: 'Asst. General Secretary', department: null, year: '2015', order_index: 4 },
  { member_name: 'Tariq Mahmud Naim', designation: 'Treasurer', department: null, year: '2015', order_index: 5 },
  { member_name: 'Sadi Mahmud Mahadi', designation: 'Asst. Treasurer', department: null, year: '2015', order_index: 6 },

  // 2014
  { member_name: 'Saiful Arefin Hemel', designation: 'President', department: null, year: '2014', order_index: 1 },
  { member_name: "Kuntal Blaise D' Costa", designation: 'Vice President', department: null, year: '2014', order_index: 2 },
  { member_name: 'Md. Rakibul Hasan', designation: 'General Secretary', department: null, year: '2014', order_index: 3 },
  { member_name: 'Saidur Rahman Shamrat', designation: 'Asst. General Secretary', department: null, year: '2014', order_index: 4 },
  { member_name: 'Fatema Tuz Zohra', designation: 'Treasurer', department: null, year: '2014', order_index: 5 },

  // 2013
  { member_name: 'Darshan Chakma', designation: 'President', department: null, year: '2013', order_index: 1 },
  { member_name: 'Jubair Bin Iqbal', designation: 'Vice President', department: null, year: '2013', order_index: 2 },
  { member_name: 'Saiful Arefin Hemel', designation: 'General Secretary', department: null, year: '2013', order_index: 3 },
  { member_name: 'Saihan Rahman', designation: 'Asst. General Secretary', department: null, year: '2013', order_index: 4 },
  { member_name: "Kuntal Blaise D' Costa", designation: 'Treasurer', department: null, year: '2013', order_index: 5 },
  { member_name: 'Akifa Rahman Ondhi', designation: 'Treasurer', department: null, year: '2013', order_index: 6 },
];

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  UIUPC Committee — Phase 4 Data Migration');
  console.log('═══════════════════════════════════════════════════\n');

  // ── STEP 1: Fetch all current committee data from DB ──
  console.log('[1/6] Fetching current committee records from Supabase...');
  const { data: existingRecords, error: fetchError } = await supabase
    .from('committees')
    .select('id, member_name, image_url, year, designation');

  if (fetchError) { console.error('❌ Failed to fetch committees:', fetchError); process.exit(1); }
  console.log(`  ✓ Found ${existingRecords.length} existing records\n`);

  // ── STEP 2: Fetch Drive folder structure ──
  console.log('[2/6] Browsing Google Drive for Committee images...');
  const root = await fetchFromDrive();
  const committeeFolder = root.subfolders?.find(f => f.name.toLowerCase() === 'committee');

  if (!committeeFolder) {
    console.error('❌ Could not find "Committee" folder in Drive root');
    console.log('  Available folders:', root.subfolders?.map(f => f.name).join(', '));
    process.exit(1);
  }

  const subfoldersRes = await fetchFromDrive(committeeFolder.id);
  const yearFolders = subfoldersRes.subfolders || [];

  // Build a year-scoped map: { "2026": [...files], "2024": [...files], ... }
  const driveFilesByYear = {};
  for (const yf of yearFolders) {
    console.log(`  Scanning Drive folder: ${yf.name}...`);
    const filesRes = await fetchFromDrive(yf.id);
    driveFilesByYear[yf.name] = filesRes.files || [];
    console.log(`    → ${driveFilesByYear[yf.name].length} files found`);
  }
  console.log(`  ✓ Scanned ${yearFolders.length} year folders\n`);

  // ── STEP 3: Fix images for existing 2026 + 2024 records ──
  console.log('[3/6] Fixing images for 2026 & 2024 committee members...');
  const yearsToFix = ['2026', '2024'];
  const imageUpdates = [];
  const unmatchedMembers = [];

  for (const year of yearsToFix) {
    const yearRecords = existingRecords.filter(r => r.year === year);
    const yearFiles = driveFilesByYear[year] || [];

    console.log(`\n  ── ${year} (${yearRecords.length} records, ${yearFiles.length} Drive files) ──`);

    for (const record of yearRecords) {
      const match = findBestMatch(record.member_name, yearFiles);

      if (match) {
        const isChanged = record.image_url !== match.id;
        if (isChanged) {
          imageUpdates.push({ id: record.id, name: record.member_name, year, newImageId: match.id, oldImageUrl: record.image_url, driveFileName: match.name });
          console.log(`  ✅ ${record.member_name} → ${match.name} (ID: ${match.id.slice(0, 12)}...)`);
        } else {
          console.log(`  ⏭️  ${record.member_name} — already correct`);
        }
      } else {
        unmatchedMembers.push({ name: record.member_name, year, currentUrl: record.image_url });
        console.log(`  ⚠️  ${record.member_name} — NO MATCH FOUND (keeping current image)`);
      }
    }
  }

  console.log(`\n  Summary: ${imageUpdates.length} images to update, ${unmatchedMembers.length} unmatched`);

  // ── STEP 4: Apply image updates ──
  if (imageUpdates.length > 0) {
    console.log('\n[4/6] Applying image updates...');

    for (const update of imageUpdates) {
      if (DRY_RUN) {
        console.log(`  [DRY] UPDATE committees SET image_url='${update.newImageId}' WHERE id='${update.id}' -- ${update.name} (${update.year})`);
      } else {
        const { error } = await supabase
          .from('committees')
          .update({ image_url: update.newImageId })
          .eq('id', update.id);

        if (error) {
          console.error(`  ❌ Failed to update ${update.name}: ${error.message}`);
        } else {
          console.log(`  ✓ Updated ${update.name} (${update.year})`);
        }
      }
    }
  } else {
    console.log('\n[4/6] No image updates needed — all correct or unmatched.');
  }

  // ── STEP 5: Insert missing historical records ──
  console.log('\n[5/6] Inserting historical committee records...');
  const insertedRecords = [];
  const skippedRecords = [];

  for (const entry of HISTORICAL_DATA) {
    // Check if this exact record already exists (same name + year + designation)
    const existing = existingRecords.find(r =>
      r.member_name?.toLowerCase().trim() === entry.member_name.toLowerCase().trim() &&
      r.year === entry.year &&
      r.designation?.toLowerCase().trim() === entry.designation.toLowerCase().trim()
    );

    if (existing) {
      skippedRecords.push(entry);
      console.log(`  ⏭️  ${entry.member_name} (${entry.year}) — already exists`);
      continue;
    }

    // Try to find an image in the matching Drive year folder
    const yearFiles = driveFilesByYear[entry.year] || [];
    const match = findBestMatch(entry.member_name, yearFiles);

    const recordToInsert = {
      member_name: entry.member_name,
      designation: entry.designation,
      department: entry.department,
      year: entry.year,
      order_index: entry.order_index,
      image_url: match ? match.id : 'PLACEHOLDER',
      social_links: {},
    };

    if (DRY_RUN) {
      const imgStatus = match ? `Drive: ${match.name}` : 'PLACEHOLDER';
      console.log(`  [DRY] INSERT ${entry.member_name} | ${entry.designation} | ${entry.year} | Image: ${imgStatus}`);
    } else {
      const { error } = await supabase.from('committees').insert([recordToInsert]);
      if (error) {
        console.error(`  ❌ Failed to insert ${entry.member_name} (${entry.year}): ${error.message}`);
      } else {
        const imgStatus = match ? `✅ ${match.name}` : '⚠️ PLACEHOLDER';
        console.log(`  ✓ Inserted ${entry.member_name} (${entry.year}) | Image: ${imgStatus}`);
      }
    }
    insertedRecords.push(entry);
  }

  // ── STEP 6: Summary Report ──
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Mode:              ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🔥 LIVE'}`);
  console.log(`  Image fixes:       ${imageUpdates.length} updates`);
  console.log(`  Unmatched images:  ${unmatchedMembers.length} (kept as-is)`);
  console.log(`  New records:       ${insertedRecords.length} inserted`);
  console.log(`  Skipped (dupes):   ${skippedRecords.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (unmatchedMembers.length > 0) {
    console.log('\n⚠️  UNMATCHED MEMBERS (require manual review):');
    console.log('─────────────────────────────────────────────');
    for (const m of unmatchedMembers) {
      console.log(`  ${m.name} (${m.year}) — Current: ${m.currentUrl || 'none'}`);
    }
  }

  // ── Write SQL backup file ──
  const sqlLines = imageUpdates.map(u =>
    `UPDATE committees SET image_url = '${u.newImageId}' WHERE id = '${u.id}'; -- ${u.name} (${u.year}) [was: ${(u.oldImageUrl || 'none').slice(0, 20)}...]`
  );
  const sqlFile = `update_committee_images_v3.sql`;
  fs.writeFileSync(sqlFile, sqlLines.join('\n'));
  console.log(`\n📄 SQL backup written to ${sqlFile}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
