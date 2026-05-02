const fs = require('fs');
const path = require('path');

const BACKUP_DATE = '2026-04-24';
const JSON_DIR = path.join(process.cwd(), 'backups', `v1_extraction_${BACKUP_DATE}`);
const CSV_DIR = path.join(JSON_DIR, 'csv');

if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

function jsonToCsv(items) {
  if (!items || items.length === 0) return '';
  const replacer = (key, value) => value === null ? '' : value;
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','), // header line
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
  return csv;
}

const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(JSON_DIR, file), 'utf8'));
  const csv = jsonToCsv(content);
  const csvFileName = file.replace('.json', '.csv');
  fs.writeFileSync(path.join(CSV_DIR, csvFileName), csv);
  console.log(`✅ Converted ${file} -> ${csvFileName}`);
});
