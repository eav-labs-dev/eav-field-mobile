/**
 * @fileoverview Deterministic validation for Expo identifiers and EAS build profiles.
 * @remarks Runs without EAS credentials and fails CI before a remote build is attempted.
 */

import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const [appConfig, easConfig] = await Promise.all([readJson('app.json'), readJson('eas.json')]);
const errors = [];

if (!appConfig.expo?.ios?.bundleIdentifier) errors.push('Missing iOS bundle identifier.');
if (!appConfig.expo?.ios?.buildNumber) errors.push('Missing iOS build number.');
if (!appConfig.expo?.android?.package) errors.push('Missing Android package identifier.');
if (!Number.isInteger(appConfig.expo?.android?.versionCode)) {
  errors.push('Android versionCode must be an integer.');
}
if (easConfig.build?.preview?.distribution !== 'internal') {
  errors.push('Preview builds must use internal distribution.');
}
if (easConfig.build?.preview?.android?.buildType !== 'apk') {
  errors.push('Android preview builds must produce an installable APK.');
}
if (!easConfig.build?.production) errors.push('Missing production build profile.');
if (easConfig.cli?.requireCommit !== true) errors.push('EAS builds must require a commit.');

if (errors.length) {
  throw new Error(`Invalid release configuration:\n- ${errors.join('\n- ')}`);
}
