/**
 * Rate-limit smoke (Layer 9) — prove hot routes return 429 under burst.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://www.missionwinning.com npm run rate-limit-smoke
 *
 * Hits POST /api/leads (5/min/IP). Expects at least one 429 when Upstash
 * (or sticky single-instance memory) is enforcing. Exit 0 if 429 seen;
 * exit 2 if all succeed (limits not enforced / Upstash likely unset);
 * exit 1 on transport/config errors.
 */
const base = (process.env.SMOKE_BASE_URL || '').replace(/\/$/, '');
const bursts = Number(process.env.RATE_LIMIT_BURSTS || 12);

if (!base) {
  console.error('Set SMOKE_BASE_URL (e.g. https://www.missionwinning.com)');
  process.exit(1);
}

const url = `${base}/api/leads`;
console.log(`Rate-limit smoke → ${url} (${bursts} POSTs)\n`);

let saw429 = false;
let other = 0;

for (let i = 0; i < bursts; i++) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: `rate-limit-smoke-${Date.now()}-${i}@example.invalid`,
      source: 'rate-limit-smoke',
    }),
  });
  const status = res.status;
  process.stdout.write(`  ${i + 1}/${bursts} → ${status}\n`);
  if (status === 429) saw429 = true;
  else if (status >= 500) other += 1;
}

console.log('');
if (saw429) {
  console.log('OK — received 429 (rate limit enforcing).');
  process.exit(0);
}

if (other > 0) {
  console.error('FAIL — server errors during burst; fix app before judging limits.');
  process.exit(1);
}

console.error(
  'WARN — no 429 in burst. Production may be missing UPSTASH_REDIS_REST_* ' +
    '(in-memory fallback does not work across serverless instances). ' +
    'See docs/PRODUCTION_STACK.md Layer 9.'
);
process.exit(2);
