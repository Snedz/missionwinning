/**
 * Board metadata, the America gate, and a squad code that must survive typing.
 *
 * Three separate failure modes live in this small module:
 *
 *   - **A board with a missing field** renders a card with a blank heading or a
 *     blank unit. The check below walks the exported array rather than a copied
 *     list, so a board added tomorrow is covered without anyone remembering.
 *   - **The America gate leaking.** `presidential-fitness` and the `class` scope
 *     belong to the America/PFT track, which is off by default and is *not*
 *     something agents may surface without an explicit enable. Both must
 *     disappear together when the flag is off — and the flag is read live, so
 *     the assertion is driven through the environment the module actually reads.
 *   - **`boardById` returning `undefined`** for an id from a stale deep link,
 *     which would crash the page rather than degrade. It falls back instead.
 *
 * `loadSquadCode` normalises rather than validates on purpose: squad codes are
 * typed by hand and shared by voice, so case and stray spaces must not split a
 * squad in two.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEADERBOARD_BOARDS,
  LEADERBOARD_SCOPES,
  SQUAD_CODE_KEY,
  boardById,
  loadSquadCode,
  saveSquadCode,
  visibleLeaderboardBoards,
  visibleLeaderboardScopes,
} from '@/lib/leaderboard/boards';
import { writeRaw, __resetForTests } from '@/lib/storage/safeStorage';

/**
 * The two switches `isAmericaTrackEnabled()` consults: its own flag, and the
 * surface-parking list (`america` is parked by default). Both are driven here
 * rather than stubbing the module, so the test exercises the real gate.
 */
const FLAG = 'NEXT_PUBLIC_AMERICA_TRACK_ENABLED';
const SURFACES = 'NEXT_PUBLIC_SURFACES';
const originals = { [FLAG]: process.env[FLAG], [SURFACES]: process.env[SURFACES] };

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

beforeEach(() => {
  __resetForTests();
  for (const [key, value] of Object.entries(originals)) setEnv(key, value);
});

describe('LEADERBOARD_BOARDS', () => {
  it('every board is renderable — id, title, subtitle, unit all present', () => {
    assert.ok(LEADERBOARD_BOARDS.length >= 3, 'precondition: several boards exist');
    for (const board of LEADERBOARD_BOARDS) {
      for (const field of ['id', 'title', 'subtitle', 'unit'] as const) {
        assert.equal(typeof board[field], 'string', `${board.id}: ${field} must be a string`);
        assert.ok((board[field] as string).trim().length > 0, `${board.id}: ${field} is empty`);
      }
    }
  });

  it('board ids are unique — a duplicate makes boardById ambiguous', () => {
    const ids = LEADERBOARD_BOARDS.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('scope ids are unique and every scope is labelled', () => {
    const ids = LEADERBOARD_SCOPES.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const scope of LEADERBOARD_SCOPES) {
      assert.ok(scope.label.trim().length > 0, `${scope.id}: empty label`);
      assert.ok(scope.description.trim().length > 0, `${scope.id}: empty description`);
    }
  });
});

describe('boardById', () => {
  it('resolves every real id to itself', () => {
    for (const board of LEADERBOARD_BOARDS) {
      assert.equal(boardById(board.id).id, board.id);
    }
  });

  it('falls back to a real board for an unknown id rather than returning undefined', () => {
    // A stale `/leaderboard?board=…` link must degrade, not crash.
    const fallback = boardById('no-such-board' as never);
    assert.ok(fallback, 'must never be undefined');
    assert.equal(fallback.id, LEADERBOARD_BOARDS[0].id);
  });
});

describe('the America track gate', () => {
  it('hides the Presidential Fitness board and the class scope when the track is off', () => {
    setEnv(FLAG, undefined);
    setEnv(SURFACES, undefined);
    const boards = visibleLeaderboardBoards().map((b) => b.id);
    const scopes = visibleLeaderboardScopes().map((s) => s.id);

    assert.ok(!boards.includes('presidential-fitness'), 'PFT board must stay behind the flag');
    assert.ok(!scopes.includes('class'), 'the PE class scope must stay behind the flag');
    // Everything else still ships — the gate must not empty the page.
    assert.equal(boards.length, LEADERBOARD_BOARDS.length - 1);
    assert.equal(scopes.length, LEADERBOARD_SCOPES.length - 1);
  });

  it('shows both when the track is enabled', () => {
    setEnv(FLAG, 'true');
    assert.ok(visibleLeaderboardBoards().some((b) => b.id === 'presidential-fitness'));
    assert.ok(visibleLeaderboardScopes().some((s) => s.id === 'class'));
  });

  it('gates the board and the scope together — they are one feature', () => {
    for (const value of [undefined, 'true'] as (string | undefined)[]) {
      setEnv(SURFACES, undefined);
      setEnv(FLAG, value);
      const hasBoard = visibleLeaderboardBoards().some((b) => b.id === 'presidential-fitness');
      const hasScope = visibleLeaderboardScopes().some((s) => s.id === 'class');
      assert.equal(hasBoard, hasScope, `flag=${value}: a class scope with no PFT board is unusable`);
    }
  });
});

describe('squad code', () => {
  it('normalises case and whitespace so one squad stays one squad', () => {
    saveSquadCode('  alpha7 ');
    assert.equal(loadSquadCode(), 'ALPHA7');
  });

  it('normalises on the read path too, for values an older build stored raw', () => {
    /*
     * Found by mutation: a round-trip through `saveSquadCode` cannot prove the
     * read path normalises, because the write path already uppercased. Writing
     * the raw value is the only way to exercise it — and it is the real case,
     * since this key predates the normalisation and squad codes are typed by
     * hand into whatever build the athlete had.
     */
    writeRaw(SQUAD_CODE_KEY, '  alpha7 ');
    assert.equal(loadSquadCode(), 'ALPHA7', 'a lowercase stored code must still match its squad');
  });

  it('truncates to the stored width on both the write and the read path', () => {
    saveSquadCode('ABCDEFGHIJKL');
    assert.equal(loadSquadCode().length, 8);

    // A longer value written by an older build must still read back clamped.
    writeRaw(SQUAD_CODE_KEY, 'ZZZZZZZZZZZZZZZZ');
    assert.equal(loadSquadCode(), 'ZZZZZZZZ');
  });

  it('reads an empty string when nothing is stored, never null', () => {
    assert.equal(loadSquadCode(), '');
    saveSquadCode('   ');
    assert.equal(loadSquadCode(), '', 'a whitespace-only code is no code');
  });
});
