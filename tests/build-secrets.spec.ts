import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const web = resolve('apps/web');

test('Next refuses to build when a privileged key is assigned to the browser key', () => {
  const pretendJwt = (role: string) => `e30.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.test-signature`;
  for (const [key, expected] of [
    ['sb_secret_synthetic', 1], [pretendJwt('service_role'), 1],
    ['sb_publishable_synthetic', 0], [pretendJwt('anon'), 0],
  ] as const) {
    const result = spawnSync(process.execPath, ['-e', 'import("./next.config.mjs")'], {
      cwd: web, env: { ...process.env, NEXT_PUBLIC_SUPABASE_ANON_KEY: key }, encoding: 'utf8',
    });
    expect(result.status).toBe(expected);
    if (expected) expect(result.stderr).toContain('must be a publishable or anon key');
    expect(result.stderr).not.toContain(key);
  }
});

test('client bundle and worker omit server credentials', () => {
  const serverOnly = ['SUPABASE_SERVICE_ROLE_KEY', 'PRIVATE_ACCESS_SECRET', 'UPSTASH_REDIS_REST_TOKEN',
    'GROQ_API_KEY', 'COACH_LLM_API_KEY', 'OPENROUTER_API_KEY'];
  const staticDir = join(web, '.next', 'static');
  const scripts = readdirSync(staticDir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.js')).map((entry) => join(staticDir, entry));
  expect(scripts.length).toBeGreaterThan(0);
  for (const file of [...scripts, join(web, 'public', 'sw.js')]) {
    const content = readFileSync(file, 'utf8');
    for (const key of serverOnly) {
      const value = process.env[key];
      if (value && value.length >= 12) expect(content.includes(value), `${key} value in ${file}`).toBe(false);
      expect(content.includes(key), `${key} reference in ${file}`).toBe(false);
    }
  }
});
