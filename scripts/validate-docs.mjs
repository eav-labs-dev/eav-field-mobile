import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'README.md',
  '.env.example',
  'docs/architecture.md',
  'docs/api-sync.md',
  'docs/authentication.md',
  'docs/demo.md',
  'docs/release.md',
  'docs/roadmap.md',
];
const screenshotFiles = [
  'docs/assets/screenshots/01-login.png',
  'docs/assets/screenshots/02-dashboard.png',
  'docs/assets/screenshots/03-assignments.png',
  'docs/assets/screenshots/04-inspection-form.png',
  'docs/assets/screenshots/05-photo-evidence.png',
  'docs/assets/screenshots/06-sync-centre.png',
  'docs/assets/screenshots/07-settings.png',
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) failures.push(`Missing required documentation: ${file}`);
}
for (const file of screenshotFiles) {
  if (!existsSync(resolve(root, file))) failures.push(`Missing Stage 1 screenshot: ${file}`);
}

const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
const localLinks = [...readme.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)].map(
  ([, target]) => target.split('#')[0],
);
for (const target of localLinks) {
  if (target && !existsSync(resolve(root, target))) failures.push(`Broken README link: ${target}`);
}

const demo = readFileSync(resolve(root, 'docs/demo.md'), 'utf8');
for (const heading of ['## Preparation', '## Primary walkthrough', '## Offline recovery', '## Evidence checklist']) {
  if (!demo.includes(heading)) failures.push(`Demo guide is missing heading: ${heading}`);
}

const environmentKeys = readFileSync(resolve(root, '.env.example'), 'utf8')
  .split('\n')
  .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
  .filter(Boolean);
for (const key of environmentKeys) {
  if (!readme.includes(`\`${key}\``)) failures.push(`README environment table is missing ${key}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `Documentation contract verified (${requiredFiles.length} required files, ${screenshotFiles.length} screenshots).`,
);
