/**
 * Transforms v1 membership JSON into v2-compatible CSV
 * with columns reordered to match the new schema:
 *   session, name, student_id, email, department, phone,
 *   payment_method, transaction_id, experience, blood_group, interests,
 *   facebook_link, message, photo_url, timestamp
 */
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(process.cwd(), 'backups', 'v1_extraction_2026-04-24');
const OUTPUT_DIR = path.join(BACKUP_DIR, 'v2_ready');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- Membership ---
const membershipRaw = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'membership_v1.json'), 'utf8'));

const V2_MEMBERSHIP_HEADERS = [
  'name', 'session', 'student_id', 'email', 'department', 'phone',
  'blood_group', 'facebook_link', 'payment_method', 'transaction_id',
  'experience', 'interests', 'message', 'photo_url', 'timestamp'
];

/**
 * ONE-TIME LEGACY FIX ONLY.
 * The old v1 forms did not collect session info, so we derive it from timestamps
 * for these 62 historical records. This function is NOT used in the live system.
 * All future membership forms will have a "session" field filled by the applicant.
 */
function deriveSession(timestamp) {
  if (!timestamp) return '';
  const year = new Date(timestamp).getFullYear();
  if (year === 2025) return 'Fall 25';
  if (year === 2026) return 'Spring 26';
  return '';
}

const membershipRows = membershipRaw.map(row => {
  return {
    name:           row['Full Name'] || '',
    session:        deriveSession(row['Timestamp'] || row['Submission Timestamp']),
    student_id:     String(row['Student ID'] || ''),
    email:          row['Email'] || '',
    department:     row['Department'] || '',
    phone:          String(row['Phone'] || ''),
    blood_group:    row['Blood Group'] || '',
    facebook_link:  row['Facebook Profile Link'] || '',
    payment_method: (row['Payment Method'] || '').toLowerCase().trim(),
    transaction_id: row['Transaction ID'] || '',
    experience:     row['Experience Level'] || '',
    interests:      row['Interests'] || '',
    message:        row['Message'] || '',
    photo_url:      row['Photo URL'] || '',
    timestamp:      row['Submission Timestamp'] || row['Timestamp'] || ''
  };
});

// --- Results ---
const resultsRaw = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'results_v1.json'), 'utf8'));

const V2_RESULTS_HEADERS = [
  'event_id', 'name', 'institute', 'category', 'photos', 'selected', 'status', 'timestamp'
];

const resultsRows = resultsRaw.map(row => ({
  event_id:  'shutter_stories_iv',
  name:      row.name || '',
  institute: row.institute || '',
  category:  row.category || '',
  photos:    String(row.photos || ''),
  selected:  String(row.selected || ''),
  status:    row.status || '',
  timestamp: row.timestamp || ''
}));

// --- Blog ---
const blogRaw = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'blog_v1.json'), 'utf8'));

const V2_BLOG_HEADERS = [
  'title', 'date', 'description', 'media', 'tags', 'author', 'status', 'timestamp'
];

const blogRows = blogRaw.map(row => ({
  title:       row.title || '',
  date:        row.date || '',
  description: row.description || '',
  media:       JSON.stringify(row.media || []),
  tags:        row.tags || '',
  author:      row.author || '',
  status:      'published',
  timestamp:   row.timestamp || ''
}));

// --- Gallery ---
const galleryRaw = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'gallery_v1.json'), 'utf8'));

const V2_GALLERY_HEADERS = [
  'title', 'event_id', 'url', 'description', 'facebook_post', 'uploaded_by', 'timestamp'
];

const galleryRows = galleryRaw.map(row => ({
  title:         row.title || '',
  event_id:      String(row.eventId || ''),
  url:           row.url || '',
  description:   row.description || '',
  facebook_post: row.facebookPost || '',
  uploaded_by:   row.uploadedBy || '',
  timestamp:     row.uploadedAt || ''
}));


// --- CSV Writer ---
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function writeCsv(filename, headers, rows) {
  const lines = [headers.join(',')];
  rows.forEach(row => {
    const line = headers.map(h => escapeCSV(row[h])).join(',');
    lines.push(line);
  });
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, lines.join('\r\n'));
  console.log('[OK] ' + filename + ' -> ' + rows.length + ' records');
}

writeCsv('membership_v2.csv', V2_MEMBERSHIP_HEADERS, membershipRows);
writeCsv('results_v2.csv',    V2_RESULTS_HEADERS,    resultsRows);
writeCsv('blog_v2.csv',       V2_BLOG_HEADERS,       blogRows);
writeCsv('gallery_v2.csv',    V2_GALLERY_HEADERS,     galleryRows);

console.log('\nAll v2-ready CSVs written to: ' + OUTPUT_DIR);
