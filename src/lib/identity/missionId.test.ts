/**
 * Mission ID rules — founder is 1, guests have none, clients do not mint.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'path';
import { formatCallSignNumber } from '@/lib/identity/athleteCard';
import {
  FOUNDER_GITHUB_LOGIN,
  FOUNDER_TEST_PROFILE,
  athleteMissionIdForCurrentUser,
  decideMissionIdClaim,
  formatMissionId,
  githubLoginFromAuthUser,
  isFounderForMissionId1,
  isFounderGithubLogin,
} from './missionId';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|routetest)\.(ts|tsx)$/.test(entry)) {
      out.push(path.relative(root, abs).split(path.sep).join('/'));
    }
  }
  return out;
}

describe('founder identity', () => {
  it('reserves GitHub Snedz — the login already public in this repo', () => {
    assert.equal(FOUNDER_GITHUB_LOGIN, 'Snedz');
    assert.equal(isFounderGithubLogin('Snedz'), true);
    assert.equal(isFounderGithubLogin('snedz'), true);
    assert.equal(isFounderGithubLogin('someone-else'), false);
    assert.equal(isFounderGithubLogin(null), false);
  });

  it('reads GitHub login from identities, not from an invented email', () => {
    const login = githubLoginFromAuthUser({
      identities: [
        {
          provider: 'github',
          identity_data: { user_name: 'Snedz', email: 'not-in-git@example.com' },
        },
      ],
    });
    assert.equal(login, 'Snedz');
    assert.equal(githubLoginFromAuthUser(null), null);
    assert.equal(githubLoginFromAuthUser({ identities: [] }), null);
  });

  it('founder profile as current user is ID 1', () => {
    assert.equal(
      isFounderForMissionId1({ githubLogin: FOUNDER_TEST_PROFILE.githubLogin }),
      true
    );
    const claim = decideMissionIdClaim({
      signedIn: true,
      existing: null,
      isFounder: true,
      id1TakenByOther: false,
    });
    assert.deepEqual(claim, { kind: 'founder-1' });
    assert.equal(
      athleteMissionIdForCurrentUser({ signedIn: true, missionId: 1 }),
      '#1'
    );
  });

  it('beta-admin email path can claim 1 without a new public address in git', () => {
    assert.equal(isFounderForMissionId1({ emailIsBetaAdmin: true }), true);
    assert.equal(isFounderForMissionId1({ githubLogin: null, emailIsBetaAdmin: false }), false);
  });
});

describe('claim decision', () => {
  it('guest has no id — nothing to mint', () => {
    assert.deepEqual(
      decideMissionIdClaim({
        signedIn: false,
        existing: null,
        isFounder: false,
        id1TakenByOther: false,
      }),
      { kind: 'none' }
    );
    assert.equal(
      athleteMissionIdForCurrentUser({ signedIn: false, missionId: 1 }),
      null
    );
    assert.equal(
      athleteMissionIdForCurrentUser({ signedIn: false, missionId: null }),
      null
    );
  });

  it('keeps an already-issued id (idempotent, including founder)', () => {
    assert.deepEqual(
      decideMissionIdClaim({
        signedIn: true,
        existing: 1,
        isFounder: true,
        id1TakenByOther: false,
      }),
      { kind: 'keep', missionId: 1 }
    );
    assert.deepEqual(
      decideMissionIdClaim({
        signedIn: true,
        existing: 7,
        isFounder: false,
        id1TakenByOther: true,
      }),
      { kind: 'keep', missionId: 7 }
    );
  });

  it('ID 1 cannot be issued twice', () => {
    const first = decideMissionIdClaim({
      signedIn: true,
      existing: null,
      isFounder: true,
      id1TakenByOther: false,
    });
    assert.equal(first.kind, 'founder-1');
    const second = decideMissionIdClaim({
      signedIn: true,
      existing: null,
      isFounder: true,
      id1TakenByOther: true,
    });
    assert.equal(second.kind, 'next');
    assert.notEqual(second.kind, 'founder-1');
  });

  it('non-founder never receives 1 from the decision', () => {
    const d = decideMissionIdClaim({
      signedIn: true,
      existing: null,
      isFounder: false,
      id1TakenByOther: false,
    });
    assert.equal(d.kind, 'next');
  });
});

describe('display', () => {
  it('formats #N and does not collide with call-sign padding', () => {
    assert.equal(formatMissionId(1), '#1');
    assert.equal(formatCallSignNumber(1), '01');
    assert.equal(formatMissionId(12), '#12');
  });

  it('Athlete Page shows #1 when the founder profile is the current user', () => {
    const profile = read('src/page-components/ProfilePage.tsx');
    assert.match(profile, /MissionIdView/);
    assert.match(profile, /useMissionId/);
    const account = read('src/page-components/AccountPage.tsx');
    assert.match(account, /useMissionId/);
    const accountCard = read('src/components/profile/ProfileAccountCard.tsx');
    assert.match(accountCard, /MissionIdView/);
    const view = read('src/components/profile/MissionIdView.tsx');
    assert.match(view, /data-testid="mission-id"/);
    assert.match(view, /formatMissionId|athleteMissionIdForCurrentUser/);
    assert.equal(
      athleteMissionIdForCurrentUser({ signedIn: true, missionId: 1 }),
      '#1'
    );
  });
});

describe('no client mint · not on the log path', () => {
  it('the API is GET only and accepts no id in a body', () => {
    const route = read('app/api/account/mission-id/route.ts');
    assert.match(route, /export const GET/);
    assert.doesNotMatch(route, /export const POST/);
    assert.doesNotMatch(route, /export const PUT/);
    assert.doesNotMatch(route, /missionId:\s*body/);
    assert.match(route, /claimMissionIdForUser/);
  });

  it('useMissionId stays null when mint is dark — no invented integer', () => {
    const src = read('src/hooks/useMissionId.ts');
    assert.match(src, /if \(!isSupabaseConfigured\(\)\) return/);
    assert.match(src, /if \(!res\.ok\) return/);
    assert.doesNotMatch(src, /setMissionId\(\s*[1-9]/);
    assert.match(src, /Guests stay null/);
  });

  it('client surfaces never write mission_ids or stash an id locally', () => {
    const clientDirs = [
      'src/components',
      'src/page-components',
      'src/hooks',
      'src/store',
    ];
    const files = clientDirs.flatMap((d) => walk(path.join(root, d)));
    const offenders: string[] = [];
    for (const file of files) {
      const src = read(file);
      if (/\.from\(\s*['"]mission_ids['"]\s*\)\s*\.insert/.test(src)) offenders.push(`${file}: insert`);
      if (/STORAGE_KEYS\.missionId|mw_mission_id/.test(src)) offenders.push(`${file}: storage`);
      if (/method:\s*['"]POST['"]/.test(src) && /mission-id/.test(src)) {
        offenders.push(`${file}: POST mint`);
      }
    }
    assert.deepEqual(offenders, []);
  });

  it('Train / Today / Coach never mention Mission ID', () => {
    const banned = [
      'src/page-components/HomePage.tsx',
      'src/page-components/ActiveWorkoutPage.tsx',
      'src/page-components/CoachPage.tsx',
    ];
    for (const file of banned) {
      const src = read(file);
      assert.doesNotMatch(src, /missionId|Mission ID|MissionId/, `${file} must not show Mission ID`);
    }
    for (const file of walk(path.join(root, 'src/lib/coach'))) {
      const src = read(file);
      assert.doesNotMatch(
        src,
        /missionId|Mission ID|from ['"]@\/lib\/identity\/missionId/,
        `${file} planner must not read Mission ID`
      );
    }
  });
});
