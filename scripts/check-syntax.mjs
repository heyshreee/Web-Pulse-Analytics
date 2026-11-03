#!/usr/bin/env node
/**
 * Cross-platform JavaScript syntax check for a source directory.
 * Usage: node scripts/check-syntax.mjs backend/src
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const target = resolve(process.argv[2] ?? 'backend/src');

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const files = walk(target).filter((file) => file.endsWith('.js')).sort();
if (files.length === 0) {
  console.error(`No JavaScript files found under ${target}`);
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}

if (failed) {
  console.error('Syntax check failed.');
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} files.`);
