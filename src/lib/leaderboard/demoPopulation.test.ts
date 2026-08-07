/**
 * The pacers, and the label that keeps them honest.
 *
 * A leaderboard with nobody on it is worse than useless for a pre-launch app,
 * so the boards are seeded with a synthetic population. The founder rule
 * (CONTEXT.md, full-launch override) is explicit: **no fake leaderboard humans
 * without a Pacer label.** `demoEntriesForBoard` is the only path that puts
 * these rows on a board, and it must therefore mark every one of them
 * `isPacer` — a single unlabelled row is an invented human being.
 *
 * The population is also deterministic on purpose (`hashSeed`, no RNG): the same
 * athlete must not see the ladder reshuffle under them on every render. That is
 * asserted directly, because "seeded" is the kind of property a refactor to
 * `Math.random()` breaks silently.
 *
 * `snapshotToEntry` is the board-to-field switch, and every board must map to a
 * real number — a missing case returns `undefined`, which sorts unpredictably
 * and renders as a blank score.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDemoPopulation,
  demoEntriesForBoard,
  snapshotToEntry,
} from '@/lib/leaderboard/demoPopulation';
import { LEADERBOARD_BOARDS } from '@/lib/leaderboard/boards';

const BOARD_IDS = LEADERBOARD_BOARDS.map((b) => b.id);

describe('buildDemoPopulation', () => {
  it('is deterministic — the ladder does not reshuffle between renders', () => {
    const a = buildDemoPopulation();
    const b = buildDemoPopulation();
    assert.deepEqual(a, b, 'a seeded population must be reproducible');
  });

  it('honours the requested size', () => {
    assert.equal(buildDemoPopulation(10).length, 10);
    assert.ok(buildDemoPopulation().length > 10, 'the default population is a full ladder');
  });

  it('gives every pacer a complete, renderable identity', () => {
    for (const snap of buildDemoPopulation(24)) {
      for (const field of ['operatorName', 'region', 'countryCode', 'countryName', 'locale'] as const) {
        assert.ok(
          typeof snap[field] === 'string' && (snap[field] as string).length > 0,
          `${snap.operatorName}: ${field} is missing`
        );
      }
      assert.ok(Number.isFinite(snap.missionScore), 'missionScore must be a number');
      assert.ok(snap.missionScore >= 0, 'a negative score would sort below every real athlete');
    }
  });

  it('keeps country and macro-region consistent', () => {
    // A pacer whose country sits in the wrong region corrupts regional scope
    // filtering, which is the one thing scope-filtered boards are for.
    const byCountry = new Map<string, string>();
    for (const snap of buildDemoPopulation()) {
      const seen = byCountry.get(snap.countryCode);
      if (seen) {
        assert.equal(seen, snap.region, `${snap.countryCode} appears in two regions`);
      } else {
        byCountry.set(snap.countryCode, snap.region);
      }
    }
    assert.ok(byCountry.size > 1, 'precondition: the population spans several countries');
  });

  it('carries no real user identity', () => {
    // These are not people; nothing may look like a signed-in athlete.
    for (const snap of buildDemoPopulation(24)) {
      assert.equal(snap.userId, undefined, 'a pacer must not carry a userId');
    }
  });
});

describe('snapshotToEntry', () => {
  it('maps every board to a finite score — no board falls through the switch', () => {
    const [snap] = buildDemoPopulation(1);
    for (const boardId of BOARD_IDS) {
      const entry = snapshotToEntry(snap, boardId);
      assert.ok(
        Number.isFinite(entry.score),
        `${boardId}: score is ${entry.score} — a missing switch case renders blank and sorts wrong`
      );
    }
  });

  it('reads a different field per board rather than one score everywhere', () => {
    const snap = { ...buildDemoPopulation(1)[0], missionScore: 11, trainingStreak: 22, weeklyVolume: 33 };
    assert.equal(snapshotToEntry(snap, 'mission-score').score, 11);
    assert.equal(snapshotToEntry(snap, 'training-streak').score, 22);
    assert.equal(snapshotToEntry(snap, 'weekly-volume').score, 33);
  });

  it('passes through the flags the UI uses to label a row', () => {
    const [snap] = buildDemoPopulation(1);
    const entry = snapshotToEntry(snap, 'mission-score', { isPacer: true, id: 'demo-0', delta: -2 });
    assert.equal(entry.isPacer, true);
    assert.equal(entry.id, 'demo-0');
    assert.equal(entry.delta, -2);
    assert.ok(!entry.isYou, 'a pacer is never "you"');
  });
});

describe('demoEntriesForBoard', () => {
  it('labels every synthetic row as a pacer, on every board', () => {
    // The founder rule, asserted where it is actually decided.
    for (const boardId of BOARD_IDS) {
      const entries = demoEntriesForBoard(boardId);
      assert.ok(entries.length > 0, `${boardId}: no demo entries`);
      for (const entry of entries) {
        assert.equal(entry.isPacer, true, `${boardId}: "${entry.operatorName}" is an unlabelled human`);
        assert.ok(!entry.isYou, `${boardId}: a pacer must never be marked as you`);
      }
    }
  });

  it('gives every row a unique id so ranking cannot collapse two pacers', () => {
    const ids = demoEntriesForBoard('mission-score').map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});
