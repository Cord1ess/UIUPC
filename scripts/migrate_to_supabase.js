/**
 * UIUPC Data Migration Script (Phase 2) — v2
 * 
 * Uses ALL committee sources:
 *   - committee2026.json (Current 2025-2026)
 *   - members.ts PREVIOUS_COMMITTEES (2023, 2022, 2019)
 * 
 * Usage: node scripts/migrate_to_supabase.js
 * Output: scripts/migration_output.sql
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// HELPERS
// ============================================================

function escapeSql(str) {
  if (str === null || str === undefined || str === '') return 'NULL';
  const escaped = String(str).replace(/'/g, "''").trim();
  return `'${escaped}'`;
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] ? values[idx].trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ============================================================
// MIGRATION: MEMBERS (from membership_v2.csv)
// ============================================================

function generateMemberInserts() {
  const csvPath = path.join(__dirname, '..', 'backups', 'v1_extraction_2026-04-24', 'v2_ready', 'membership_v2.csv');
  if (!fs.existsSync(csvPath)) return '-- ERROR: membership_v2.csv not found\n';

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvText);

  // Filter out corrupted rows (rows where name contains commas from bad CSV parsing)
  const cleanRows = rows.filter(row => {
    const name = row.name || '';
    // Skip rows with no proper name or with comma-separated junk
    if (!name || name.length > 100 || name.includes(',http')) return false;
    return true;
  });

  let sql = '-- ============================================================\n';
  sql += `-- MEMBERS MIGRATION (${cleanRows.length} clean records, ${rows.length - cleanRows.length} skipped as corrupted)\n`;
  sql += '-- ============================================================\n\n';

  for (const row of cleanRows) {
    sql += `INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (\n`;
    sql += `  ${escapeSql(row.name)},\n`;
    sql += `  ${escapeSql(row.session)},\n`;
    sql += `  ${escapeSql(row.student_id)},\n`;
    sql += `  ${escapeSql(row.email)},\n`;
    sql += `  ${escapeSql(row.department)},\n`;
    sql += `  ${escapeSql(row.phone)},\n`;
    sql += `  ${escapeSql(row.blood_group)},\n`;
    sql += `  ${escapeSql(row.facebook_link)},\n`;
    sql += `  ${escapeSql(row.payment_method)},\n`;
    sql += `  ${escapeSql(row.transaction_id)},\n`;
    sql += `  ${escapeSql(row.photo_url)},\n`;
    sql += `  ${row.timestamp ? escapeSql(row.timestamp) : 'now()'}\n`;
    sql += `);\n\n`;
  }

  return sql;
}

// ============================================================
// MIGRATION: ALL COMMITTEES (Current + Historical)
// ============================================================

function generateAllCommitteeInserts() {
  let sql = '-- ============================================================\n';
  sql += '-- COMMITTEE MIGRATION (All Years)\n';
  sql += '-- ============================================================\n\n';

  let totalCount = 0;

  // ─── 1. Current Committee 2025-2026 (from committee2026.json) ───
  const currentPath = path.join(__dirname, '..', 'src', 'data', 'committee2026.json');
  if (fs.existsSync(currentPath)) {
    const current = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));
    sql += `-- Current Committee: 2025-2026 (${current.length} members)\n\n`;

    for (const m of current) {
      const socialLinks = JSON.stringify({});
      sql += `INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (\n`;
      sql += `  ${escapeSql(m.name)},\n`;
      sql += `  ${escapeSql(m.role)},\n`;
      sql += `  ${escapeSql(m.department)},\n`;
      sql += `  ${escapeSql(m.profileImage)},\n`;
      sql += `  '2025-2026',\n`;
      sql += `  ${m.id},\n`;
      sql += `  '${socialLinks}',\n`;
      sql += `  true\n`;
      sql += `);\n\n`;
      totalCount++;
    }
  }

  // ─── 2. Historical Committees (parsed from members.ts) ───
  // Since members.ts is TypeScript, we manually define the data here
  // matching the exact content of PREVIOUS_COMMITTEES

  const historicalCommittees = [
    {
      year: "2023",
      members: [
        { name: "Pulok Sikdar", role: "President", tag: "Core", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/pulok_fotumj.jpg" },
        { name: "Nafis Nawal", role: "Vice President", tag: "Core", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/nafis_fslsiw.jpg" },
        { name: "Md Mahmudul Hasan", role: "General Secretary", tag: "Core", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/hasan_p7zfgk.jpg" },
        { name: "Ahmad Hasan", role: "Asst. General Secretary", tag: "Core", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/ahmad_enzaam.jpg" },
        { name: "Muhit Khan", role: "Treasurer", tag: "Core", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/muhit_pvc0bx.jpg" },
        { name: "Anika Anjum Mona", role: "Asst. Treasurer", tag: "Core", department: "Environment and Development Studies", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/mona_y54t2k.jpg" },
        { name: "Ishrak Ahmed", role: "Head of Design", tag: "Design", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/ishrak_yyw6tr.jpg" },
        { name: "Md Reza", role: "Head of Org.", tag: "Organizers", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/reza_raexvo.jpg" },
        { name: "Abdul Mohsen Rubay", role: "Head of PR", tag: "Public Relations", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761984293/rubay_tdrwo8.jpg" },
        { name: "Md Zobaer Ahmed", role: "Head of HR", tag: "Human Resources", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/zobayer_rztaox.jpg" },
        { name: "Dipto Mahdud Sultan", role: "Head of Event", tag: "Event", department: "Department of MSJ", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/dipto_yxckvv.jpg" },
        { name: "Tahsin Topu", role: "Asst. Head of ORG", tag: "Organizers", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983046/topu_g4zpf6.jpg" },
        { name: "Tanvir Ahmed", role: "Asst. Head of ORG", tag: "Organizers", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/tanvir_cuzdid.jpg" },
        { name: "Jonayed", role: "Designer", tag: "Design", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/Jonayed_ozbke5.jpg" },
        { name: "Siddiquee Shuaib", role: "Asst. Head of PR", tag: "Public Relations", department: "Electrical & Electronic Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shuaib_yripkq.jpg" },
        { name: "Ishrak Farhan", role: "Asst. Head of HR", tag: "Human Resources", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/farhan_z4d9el.jpg" },
        { name: "Rifat Hassan Rabib", role: "Asst. Head of HR", tag: "Human Resources", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/rabib_dzpawf.jpg" },
        { name: "Minhaz Hossain Shemul", role: "Executives", tag: "Executives", department: "Electrical & Electronic Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shemul_o2n1am.jpg" },
        { name: "Mayesha Nur", role: "Executives", tag: "Executives", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/maisha_eawkws.jpg" },
        { name: "Jahid Hasan Sabbir", role: "Executives", tag: "Executives", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/sabbir_tdtnke.jpg" },
        { name: "Zannatul Amin", role: "Executives", tag: "Executives", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/anika_anssy2.jpg" },
        { name: "Arean Nobi", role: "Executives", tag: "Executives", department: "Computer Science & Engineering", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/arean_ubnwpt.jpg" },
      ]
    },
    {
      year: "2022",
      members: [
        { name: "Arif Mahmud", role: "President", tag: "Core", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/arifPC22_n4oa2o.jpg" },
        { name: "Mirza Muyammar Munnaf hussain Baig", role: "General Secretary", tag: "Core", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/munnafPC22_ugukeg.jpg" },
        { name: "Rabius Sany Jabiullah", role: "Treasurer", tag: "Core", profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop" },
        { name: "Adib Mahmud", role: "Asst. Treasurer", tag: "Core", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808128/adibPC22_qpwopz.jpg" },
      ]
    },
    {
      year: "2019",
      members: [
        { name: "Saikat Kumar Saha", role: "President", tag: "Core", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808335/saikatPC19_hmpdkx.jpg" },
        { name: "M Shamim Reza", role: "General Secretary", tag: "Core", profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808402/shamimPC19_eoi3oq.jpg" },
        { name: "S. M. Abu Hena", role: "Asst. General Secretary", tag: "Core", profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop" },
        { name: "Mohiuzzaman", role: "Treasurer", tag: "Core", profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop" },
        { name: "Sadia Islam", role: "Asst. Treasurer", tag: "Core", profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop" },
      ]
    }
  ];

  for (const committee of historicalCommittees) {
    sql += `-- Historical Committee: ${committee.year} (${committee.members.length} members)\n\n`;

    committee.members.forEach((m, idx) => {
      const socialLinks = JSON.stringify({});
      sql += `INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (\n`;
      sql += `  ${escapeSql(m.name)},\n`;
      sql += `  ${escapeSql(m.role)},\n`;
      sql += `  ${m.department ? escapeSql(m.department) : 'NULL'},\n`;
      sql += `  ${escapeSql(m.profileImage)},\n`;
      sql += `  '${committee.year}',\n`;
      sql += `  ${idx + 1},\n`;
      sql += `  '${socialLinks}',\n`;
      sql += `  false\n`;
      sql += `);\n\n`;
      totalCount++;
    });
  }

  // Update the header with actual count
  sql = sql.replace('COMMITTEE MIGRATION (All Years)', `COMMITTEE MIGRATION (${totalCount} total across all years)`);

  return sql;
}

// ============================================================
// MIGRATION: ACHIEVEMENTS
// ============================================================

function generateAchievementInserts() {
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'achievements.json');
  if (!fs.existsSync(jsonPath)) return '-- ERROR: achievements.json not found\n';

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let sql = '-- ============================================================\n';
  sql += `-- ACHIEVEMENTS MIGRATION (${data.length} records)\n`;
  sql += '-- ============================================================\n\n';

  for (const item of data) {
    const tagsArray = `ARRAY[${item.tags.map(t => `'${t}'`).join(', ')}]::TEXT[]`;
    sql += `INSERT INTO achievements (title, description, year, image_url, tags) VALUES (\n`;
    sql += `  ${escapeSql(item.title)},\n`;
    sql += `  ${escapeSql(item.description)},\n`;
    sql += `  ${escapeSql(item.year)},\n`;
    sql += `  ${escapeSql(item.image)},\n`;
    sql += `  ${tagsArray}\n`;
    sql += `);\n\n`;
  }

  return sql;
}

// ============================================================
// NOTE: Exhibition Submissions (Shutter Stories IV) are NOT
// included in this migration. The data is safely archived in:
//   backups/v1_extraction_2026-04-24/v2_ready/results_v2.csv
// It will be imported when the Exhibition Archive feature is built.
// ============================================================

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 UIUPC Migration Script v3 - Generating SQL...\n');

  let fullSql = '-- ============================================================\n';
  fullSql += '-- UIUPC CORE DATA MIGRATION v3\n';
  fullSql += '-- Generated: ' + new Date().toISOString() + '\n';
  fullSql += '-- Run this in Supabase Dashboard > SQL Editor\n';
  fullSql += '-- NOTE: Exhibition data (Shutter Stories IV) is archived\n';
  fullSql += '--       in CSV and will be imported separately later.\n';
  fullSql += '-- ============================================================\n\n';
  fullSql += 'BEGIN;\n\n';

  console.log('📋 Processing members...');
  fullSql += generateMemberInserts();

  console.log('👥 Processing ALL committees (Current + 2023 + 2022 + 2019)...');
  fullSql += generateAllCommitteeInserts();

  console.log('🏆 Processing achievements...');
  fullSql += generateAchievementInserts();

  console.log('📷 Skipping exhibition submissions (archived in CSV).');

  fullSql += 'COMMIT;\n';

  const outputPath = path.join(__dirname, 'migration_output.sql');
  fs.writeFileSync(outputPath, fullSql, 'utf-8');

  console.log(`\n✅ Migration SQL written to: ${outputPath}`);
  console.log(`📊 Copy into Supabase SQL Editor and run.`);
}

main();
