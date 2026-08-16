import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  EXCELLENCE_RESULT_PATH,
  KNOWN_TOP_LEVELS,
  allowsSurfaceShip,
  blockedSurfacePaths,
  changedPathDiffArgs,
  classifyPath,
  overrideLogArgs,
  readExcellenceOverride,
  readExcellenceStatus,
  topLevelClassificationGaps,
} from './excellenceGate';

const root = path.join(import.meta.dirname, '..', '..');

test('RESULT file exists with parseable status (bootstrap)', () => {
  const abs = path.join(root, EXCELLENCE_RESULT_PATH);
  assert.equal(existsSync(abs), true, `${EXCELLENCE_RESULT_PATH} must exist`);
  const status = readExcellenceStatus(readFileSync(abs, 'utf8'));
  assert.ok(
    status === 'unscored' || status === 'pass' || status === 'fail',
    `status must be one of three, got ${status}`
  );
});

test('readExcellenceStatus: pass / fail / unscored', () => {
  assert.equal(readExcellenceStatus('- **status:** pass\n'), 'pass');
  assert.equal(readExcellenceStatus('- **status:** fail\n'), 'fail');
  assert.equal(readExcellenceStatus('- **status:** unscored\n'), 'unscored');
  assert.equal(readExcellenceStatus('status: pass\n'), 'pass');
});

test('readExcellenceStatus: missing or unknown → unscored (fail closed)', () => {
  const warns: string[] = [];
  assert.equal(readExcellenceStatus('# no status', (m) => warns.push(m)), 'unscored');
  assert.equal(readExcellenceStatus('- **status:** yes\n', (m) => warns.push(m)), 'unscored');
  assert.ok(warns.some((w) => w.includes('yes')));
});

test('allowsSurfaceShip: only pass or override', () => {
  assert.equal(allowsSurfaceShip('pass', false), true);
  assert.equal(allowsSurfaceShip('fail', false), false);
  assert.equal(allowsSurfaceShip('unscored', false), false);
  assert.equal(allowsSurfaceShip('unscored', true), true);
  assert.equal(allowsSurfaceShip('fail', true), true);
});

test('classifyPath: wedge routes and workout trees', () => {
  assert.equal(classifyPath('app/(app)/active/page.tsx'), 'wedge');
  assert.equal(classifyPath('app/(app)/log/page.tsx'), 'wedge');
  assert.equal(classifyPath('app/(app)/coach/page.tsx'), 'wedge');
  assert.equal(classifyPath('src/components/workout/ActiveSetOptionsMenu.tsx'), 'wedge');
  assert.equal(classifyPath('src/lib/workout/workoutVictory.ts'), 'wedge');
  assert.equal(classifyPath('src/components/today/TodayDashboardHeader.tsx'), 'wedge');
  assert.equal(classifyPath('src/components/journey/FirstStepsCard.tsx'), 'wedge');
  assert.equal(classifyPath('src/lib/coach/planEngine.ts'), 'wedge');
  assert.equal(classifyPath('src/page-components/ActiveWorkoutPage.tsx'), 'wedge');
  assert.equal(classifyPath('src/page-components/HomePage.tsx'), 'wedge');
  assert.equal(classifyPath('src/page-components/CoachPage.tsx'), 'wedge');
  assert.equal(classifyPath('packages/mw-core/src/index.ts'), 'wedge');
  assert.equal(classifyPath('src/store/activeWorkout.ts'), 'wedge');
  assert.equal(classifyPath('src/lib/sync/outbox.ts'), 'wedge');
  assert.equal(classifyPath('src/lib/storage/safeStorage.ts'), 'wedge');
  assert.equal(classifyPath('app/api/coach/daily-insight/route.ts'), 'wedge');
});

test('classifyPath: surface defaults and coach voice/chat', () => {
  assert.equal(classifyPath('app/(app)/america/page.tsx'), 'surface');
  assert.equal(classifyPath('src/page-components/AmericaPage.tsx'), 'surface');
  assert.equal(classifyPath('src/i18n/en.ts'), 'surface');
  assert.equal(classifyPath('app/api/coach/chat/route.ts'), 'surface');
  assert.equal(classifyPath('app/api/coach/plan-voice/route.ts'), 'surface');
  assert.equal(classifyPath('apps/android/app/src/main/AndroidManifest.xml'), 'surface');
});

test('classifyPath: infra bootstrap paths', () => {
  assert.equal(classifyPath(EXCELLENCE_RESULT_PATH), 'infra');
  assert.equal(classifyPath('src/lib/excellenceGate.ts'), 'infra');
  assert.equal(classifyPath('src/lib/excellenceGate.test.ts'), 'infra');
  assert.equal(classifyPath('scripts/check-excellence-gate.ts'), 'infra');
  assert.equal(classifyPath('scripts/gate.mjs'), 'infra');
  assert.equal(classifyPath('ORCHESTRATION.md'), 'infra');
  assert.equal(classifyPath('src/lib/buildInfo.ts'), 'infra');
  assert.equal(classifyPath('apps/android/FOUNDER_ACCEPT.md'), 'infra');
});

test('mutants A–E: blockedSurfacePaths policy', () => {
  // A: surface + unscored → blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'unscored', false),
    ['src/page-components/AmericaPage.tsx']
  );
  // B: wedge + unscored → not blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/lib/workout/workoutVictory.ts'], 'unscored', false),
    []
  );
  // C: surface + fail → blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/i18n/en.ts'], 'fail', false),
    ['src/i18n/en.ts']
  );
  // D: surface + pass → allowed
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'pass', false),
    []
  );
  // E: surface + unscored + override → allowed
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'unscored', true),
    []
  );
});

test('readExcellenceOverride: trailer, PR body, CI ignores env', () => {
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['fix: x\n\nExcellence-Override: hotfix'],
      isCI: true,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      prBody: 'Excellence-Override: squash reason',
      isCI: true,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      envOverride: true,
      isCI: true,
    }),
    false
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      envOverride: true,
      isCI: false,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['Excellence-Override:'],
      isCI: false,
    }),
    false
  );
});

test('staleness: KNOWN_TOP_LEVELS matches discovered tree (mutant F)', () => {
  const { missingFromMap, staleInMap } = topLevelClassificationGaps(root);
  assert.deepEqual(
    missingFromMap,
    [],
    `Add new top-levels to KNOWN_TOP_LEVELS in excellenceGate.ts: ${missingFromMap.join(', ')}`
  );
  assert.deepEqual(
    staleInMap,
    [],
    `Remove stale KNOWN_TOP_LEVELS entries: ${staleInMap.join(', ')}`
  );
  // Synthetic: a never-seen key is not in the map
  assert.equal(Object.prototype.hasOwnProperty.call(KNOWN_TOP_LEVELS, 'app/(app)/newthing'), false);
});

/*
 * The range guards below run against a real repository rather than asserting the
 * dot count in a string. The defect they exist for was never a spelling anyone
 * would read as wrong — `base...HEAD` is correct for the diff on the line above
 * it, and the override reader was given the same range because it looked like
 * the same question. Only git can settle what each range actually returns, so
 * the fixture asks git.
 */

/** Hermetic: no global/system gitconfig, no signing, fixed identity. */
function fixtureGit(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
      GIT_AUTHOR_NAME: 'fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
      GIT_COMMITTER_NAME: 'fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
    },
  }).trim();
}

/**
 * A ── B  master   (B carries `Excellence-Override:`)
 *  └─── C  feat    (C carries no trailer, and touches a surface path)
 *
 * `feat` is one commit behind master — the ordinary state of any branch opened
 * before the last merge. Returns the repo dir; caller removes it.
 */
function buildDivergedRepo(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'excellence-range-'));
  fixtureGit(dir, 'init', '-q', '-b', 'master');
  writeFileSync(path.join(dir, 'base.txt'), 'a\n');
  fixtureGit(dir, 'add', '-A');
  fixtureGit(dir, 'commit', '-q', '--no-gpg-sign', '-m', 'A: base commit, no trailer');
  const a = fixtureGit(dir, 'rev-parse', 'HEAD');

  // B — a real master ship, authorised by its own trailer.
  writeFileSync(path.join(dir, 'master-only.txt'), 'b\n');
  fixtureGit(dir, 'add', '-A');
  fixtureGit(
    dir,
    'commit',
    '-q',
    '--no-gpg-sign',
    '-m',
    'B: master ship\n\nExcellence-Override: base-side ship, not this branch'
  );

  // C — the branch under test, opened from A, carrying no trailer of its own.
  fixtureGit(dir, 'checkout', '-q', '-b', 'feat', a);
  writeFileSync(path.join(dir, 'branch-only.txt'), 'c\n');
  fixtureGit(dir, 'add', '-A');
  fixtureGit(dir, 'commit', '-q', '--no-gpg-sign', '-m', 'C: surface change, no trailer');
  return dir;
}

test('overrideLogArgs: a base-side trailer cannot authorise this branch', () => {
  const dir = buildDivergedRepo();
  try {
    // The argv the script runs, verb and range together — a swapped pairing
    // fails here rather than needing a separate guard to notice it.
    const branchSide = fixtureGit(dir, ...overrideLogArgs('master'));

    // The branch's own commit is the only thing consulted…
    assert.match(branchSide, /C: surface change/);
    assert.doesNotMatch(
      branchSide,
      /Excellence-Override:/,
      'branch-side log must not contain master-side trailers'
    );
    assert.equal(
      readExcellenceOverride({ commitMessages: [branchSide], isCI: true }),
      false,
      'a branch with no trailer of its own must not be authorised'
    );

    // …and the range this replaced would have said yes. Asserted, not narrated:
    // without this the guard passes just as happily against the defect.
    const symmetric = fixtureGit(dir, 'log', '--format=%B', 'master...HEAD');
    assert.match(
      symmetric,
      /Excellence-Override:/,
      'fixture is wrong if the symmetric range carries no base-side trailer'
    );
    assert.equal(
      readExcellenceOverride({ commitMessages: [symmetric], isCI: true }),
      true,
      'symmetric difference borrows the base-side override — the defect this pins'
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('overrideLogArgs: the branch is still authorised by its own trailer', () => {
  const dir = buildDivergedRepo();
  try {
    fixtureGit(
      dir,
      'commit',
      '-q',
      '--no-gpg-sign',
      '--allow-empty',
      '-m',
      'D: hotfix\n\nExcellence-Override: surface hotfix, founder asked'
    );
    const branchSide = fixtureGit(dir, ...overrideLogArgs('master'));
    assert.equal(
      readExcellenceOverride({ commitMessages: [branchSide], isCI: true }),
      true,
      'the documented escape hatch must still open'
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('changedPathDiffArgs: stays merge-base, so base-side edits are not this branch', () => {
  const dir = buildDivergedRepo();
  try {
    const changed = fixtureGit(dir, ...changedPathDiffArgs('master'))
      .split('\n')
      .filter(Boolean);
    assert.deepEqual(
      changed,
      ['branch-only.txt'],
      'merge-base diff reports only what this branch touched'
    );

    // Two-dot here is the mirrored defect: master's file reported as the
    // branch's change, blocking a branch for a surface path it never opened.
    const twoDot = fixtureGit(dir, 'diff', '--name-only', 'master..HEAD')
      .split('\n')
      .filter(Boolean);
    assert.ok(
      twoDot.includes('master-only.txt'),
      'two-dot diff drags in base-side files — why the diff keeps three dots'
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
