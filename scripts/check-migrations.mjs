import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const migrationsDir = path.resolve('supabase/migrations');
const filenamePattern = /^(\d{14})_([a-z0-9_]+)\.sql$/;

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error('No SQL migrations found in supabase/migrations.');
  process.exit(1);
}

const seenTimestamps = new Map();
let failed = false;

for (const file of files) {
  const match = filenamePattern.exec(file);
  if (!match) {
    console.error(
      `Invalid migration filename: ${file} (expected YYYYMMDDHHMMSS_snake_case.sql)`
    );
    failed = true;
    continue;
  }

  const [, timestamp] = match;
  if (seenTimestamps.has(timestamp)) {
    console.error(
      `Duplicate migration timestamp ${timestamp}: ${seenTimestamps.get(timestamp)} and ${file}`
    );
    failed = true;
  }
  seenTimestamps.set(timestamp, file);

  const sql = await readFile(path.join(migrationsDir, file), 'utf8');
  if (!sql.trim()) {
    console.error(`Empty migration: ${file}`);
    failed = true;
  }

  if (/\bDROP\s+DATABASE\b/i.test(sql) || /\bDROP\s+SCHEMA\s+public\s+CASCADE\b/i.test(sql)) {
    console.error(`Destructive statement found in ${file}. Review it manually.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Validated ${files.length} migration files (static checks only; no SQL executed).`);
