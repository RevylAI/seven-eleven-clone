// Run only after opening the app's sign-in form on your selected Revyl device.
import { readFileSync, appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
const [role, sessionId] = process.argv.slice(2);
if (!['shopper', 'manager'].includes(role) || !sessionId)
  throw new Error(
    'Usage: node scripts/device-login.mjs shopper|manager SESSION_ID',
  );
const account = JSON.parse(
  readFileSync('artifacts/private/dev-accounts.json', 'utf8'),
)[role];
function run(args) {
  const result = spawnSync(
    process.env.REVYL_CLI || 'revyl',
    ['device', ...args, '-s', sessionId, '--json'],
    { encoding: 'utf8' },
  );
  // Device responses can contain credentials; this ignored log stays private.
  appendFileSync(
    'artifacts/private/device-auth.log',
    result.stdout + result.stderr,
    { mode: 0o600 },
  );
  if (result.status !== 0)
    throw new Error('Device command failed. See private log.');
  return result.stdout;
}
function locate(label) {
  run(['hierarchy', '--out', 'artifacts/private/login-hierarchy.json']);
  const found = [];
  function walk(node) {
    if (
      node.AXLabel === label &&
      node.enabled &&
      node.role_description !== 'text'
    )
      found.push(node);
    (node.children || []).forEach(walk);
  }
  JSON.parse(
    readFileSync('artifacts/private/login-hierarchy.json', 'utf8'),
  ).forEach(walk);
  if (found.length !== 1)
    throw new Error(`Expected one visible ${label} control`);
  const { x, y, width, height } = found[0].frame;
  return [
    '--x',
    String(Math.round(x + width / 2)),
    '--y',
    String(Math.round(y + height / 2)),
  ];
}
// Keep clearing separate: combined clear-and-type lost the last character on
// the verified iOS Revyl session. Coordinates come from fresh accessibility data.
for (const [label, value] of [
  ['Email address', account.email],
  ['Password', account.password],
]) {
  run(['clear-text', ...locate(label)]);
  run(['type', '--clear-first=false', ...locate(label), '--text', value]);
  await setTimeout(300);
  console.log(`Filled ${label}`);
}
run(['tap', ...locate('Sign in')]);
console.log('Submitted sign-in');
