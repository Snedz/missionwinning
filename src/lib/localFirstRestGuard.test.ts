import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Rest timer must never await network / sync.
 *
 * F-001 survey signal: offline bounce + rest UX. Logging starts rest from the
 * store; if a future edit inserts `await fetch` / outbox flush before
 * `startRestTimer`, athletes feel sync-gated mid-set. Discover the rest path
 * files rather than list them — stale allowlists go silent.
 */

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const REST_PATH_MARKERS = [
  'startRestTimer',
  'planLogSetRest',
  'RestTimerBar',
  'resolveStartRestSeconds',
  'tickRestTimer',
] as const;

/** Imports that mean the rest path reached the network layer. */
const NETWORK_IMPORT =
  /from\s+['"]@\/lib\/(?:sync\/|coachSync|journeySync|workoutSync|leaderboardSync)/;

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'dist') continue;
      walkTs(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name.name) && !name.name.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Pure rest helpers + dock chrome. The workout store also mentions
 * `startRestTimer` but owns finish→outbox — checked separately for the
 * rest *method* body, not whole-file imports.
 */
const REST_LOCAL_ONLY_DIRS = [
  path.join(root, 'src/lib/workout'),
  path.join(root, 'src/components/workout'),
];

function productFilesMentioningRest(): string[] {
  const hits: string[] = [];
  for (const dir of REST_LOCAL_ONLY_DIRS) {
    for (const file of walkTs(dir)) {
      const src = readFileSync(file, 'utf8');
      if (REST_PATH_MARKERS.some((m) => src.includes(m))) {
        hits.push(path.relative(root, file));
      }
    }
  }
  return hits.sort();
}

describe('localFirstRestGuard', () => {
  it('discovers rest-path product files (not an empty allowlist)', () => {
    const files = productFilesMentioningRest();
    assert.ok(files.length >= 3, `expected rest path files, got ${files.join(', ')}`);
    assert.ok(files.some((f) => f.includes('restTimer')));
    assert.ok(files.some((f) => f.includes('RestTimerBar') || f.includes('ActiveSessionDock')));
    assert.ok(files.some((f) => f.includes('activeSessionFinish')));
  });

  it('rest helpers and UI never import sync/cloud modules', () => {
    for (const rel of productFilesMentioningRest()) {
      const src = read(rel);
      assert.doesNotMatch(
        src,
        NETWORK_IMPORT,
        `${rel} imports a sync module on the rest path`
      );
    }
  });

  it('Active log-set → rest does not await fetch/outbox/auth before startRestTimer', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const fn = page.match(
      /const handleLogSet[\s\S]*?startRestTimer\(rest\.restSeconds\);[\s\S]*?\n {2}\};/
    );
    assert.ok(fn, 'handleLogSet rest block missing');
    const body = fn![0];
    // Mid-set must stay sync — no await of any kind (session-expired / sync
    // fail-open; Kaizen Strong acceptance).
    assert.doesNotMatch(body, /\bawait\b/);
    assert.doesNotMatch(body, /\basync\b/);
    assert.doesNotMatch(body, /getUser|getSession|flushOutbox|flush\s*\(/);
    assert.match(body, /planLogSetRest/);
    assert.match(body, /startRestTimer\(rest\.restSeconds\)/);
  });

  it('store logSet + logSetAndAdvance + startRestTimer never await network/auth', () => {
    const store = read('src/store/workoutStore.ts');
    const logSet = store.match(/logSet:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\},/);
    const advance = store.match(
      /logSetAndAdvance:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\},/
    );
    const rest = store.match(/startRestTimer:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\},/);
    assert.ok(logSet, 'logSet missing');
    assert.ok(advance, 'logSetAndAdvance missing');
    assert.ok(rest, 'startRestTimer missing');
    for (const [name, block] of [
      ['logSet', logSet![0]],
      ['logSetAndAdvance', advance![0]],
      ['startRestTimer', rest![0]],
    ] as const) {
      assert.doesNotMatch(block, /\bawait\b/, `${name} must not await`);
      assert.doesNotMatch(block, /\bfetch\b/, `${name} must not fetch`);
      assert.doesNotMatch(
        block,
        /getUser|getSession|flushOutbox|flush\s*\(/,
        `${name} must not touch auth/sync`
      );
    }
    assert.match(rest![0], /resolveStartRestSeconds/);
  });

  it('Active SignInPrompt fails open when getUser rejects (session expired)', () => {
    const prompt = read('src/components/auth/SignInPrompt.tsx');
    assert.match(
      prompt,
      /getUser\(\)[\s\S]*?\.catch\(\s*\(\)\s*=>\s*setSignedIn\(false\)\s*\)/,
      'expired/rejected auth must set signedIn=false, never leave null forever'
    );
    // Prompt chrome must not disable Log / rest — it is informational only.
    assert.doesNotMatch(prompt, /\bdisabled\b/);
  });

  it('Today dashboard auth lookup fails open (status only; never gates Start)', () => {
    const dash = read('src/page-components/HomeTodayDashboard.tsx');
    assert.match(
      dash,
      /getUser\(\)[\s\S]*?\.catch\(\s*\(\)\s*=>\s*\{[\s\S]*?setUserEmail\(null\)/,
      'Today header email lookup must catch rejected getUser'
    );
    // Below-fold cloud load must not abort local pillar wins on auth throw.
    assert.match(
      dash,
      /try\s*\{\s*u\s*=\s*await getUser\(\);\s*\}\s*catch/,
      'below-fold getUser must be try/catch so local wins still load'
    );
  });

  it('LogConsole Log set has no disabled / online gate', () => {
    const consoleSrc = read('src/components/workout/LogConsole.tsx');
    const logBtn = consoleSrc.match(
      /data-testid="log-console-log-set"[\s\S]*?<\/button>/
    );
    assert.ok(logBtn, 'Log set button missing');
    assert.doesNotMatch(logBtn![0], /\bdisabled\b/);
    assert.doesNotMatch(consoleSrc, /navigator\.onLine|getUser|flushOutbox/);
  });
});
