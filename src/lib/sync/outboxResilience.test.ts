/**
 * The queue must not stop forever, and must not drop the work it was just given.
 *
 * `.211` — two defects in the module whose own header says *"Nothing is ever
 * dropped for failing… losing a workout is not an option."*
 *
 *   1. **`flushing` never cleared on a hung fetch.** It is reset in a `finally`,
 *      and `finally` runs on *settle* — a promise that never settles never runs
 *      it. Every later `flush()` returned 0 for the life of the tab, including
 *      the `online` and `visibilitychange` paths. The queue kept accepting work,
 *      the UI kept saying "pending", and nothing left the device until reload.
 *      No handler passed a signal or timeout, and `supabase-js` sets none.
 *   2. **The cap dropped the newest op.** `save()` did `ops.slice(0, MAX_QUEUE)`
 *      while `enqueue` pushes to the *end*, so at 500 ops every new
 *      `workout.upsert` was truncated by the same call that added it.
 *
 * The cap rule is pure, so it is tested directly. The flush rule is tested
 * through the module's own public surface with a handler that never settles —
 * the only honest way to assert "this does not hang forever".
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { capQueue, type OutboxOp } from '@/lib/sync/outbox';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const op = (id: string, kind: OutboxOp['kind'], createdAt = 0): OutboxOp =>
  ({
    id,
    kind,
    dedupeKey: id,
    payload: {},
    attempts: 0,
    nextAttemptAt: 0,
    createdAt,
  }) as OutboxOp;

describe('capQueue', () => {
  it('keeps everything under the cap untouched', () => {
    const ops = [op('a', 'coach.plan'), op('b', 'workout.upsert')];
    assert.deepEqual(capQueue(ops, 10), ops);
  });

  /** The defect, stated directly: the newest op must survive. */
  it('never drops the op that was just enqueued', () => {
    const ops = [
      op('old-1', 'coach.plan'),
      op('old-2', 'leaderboard.push'),
      op('newest', 'workout.upsert'),
    ];
    const capped = capQueue(ops, 2);
    assert.ok(
      capped.some((o) => o.id === 'newest'),
      'the queue dropped the work it was handed on the same call that added it'
    );
  });

  it('sheds the oldest droppable op first', () => {
    const ops = [op('a', 'coach.plan'), op('b', 'leaderboard.push'), op('c', 'journey.state')];
    assert.deepEqual(
      capQueue(ops, 2).map((o) => o.id),
      ['b', 'c'],
      'superseded state should go before newer state'
    );
  });

  /**
   * The contract this module states about itself. A coach plan or leaderboard
   * push has been overtaken by newer state; a logged workout is the one thing
   * the athlete cannot reproduce.
   */
  it('protects logged workouts while anything else could go instead', () => {
    const ops = [
      op('w1', 'workout.upsert'),
      op('w2', 'workout.upsert'),
      op('plan', 'coach.plan'),
      op('board', 'leaderboard.push'),
    ];
    const capped = capQueue(ops, 2);
    assert.deepEqual(
      capped.map((o) => o.id),
      ['w1', 'w2'],
      'workouts must outlive every other kind of queued work'
    );
  });

  it('sheds the oldest workout only when the queue is all workouts', () => {
    const ops = [op('w1', 'workout.upsert'), op('w2', 'workout.upsert'), op('w3', 'workout.upsert')];
    assert.deepEqual(
      capQueue(ops, 2).map((o) => o.id),
      ['w2', 'w3'],
      'past that point the device is far beyond any recoverable state, and the newest still wins'
    );
  });

  it('drops exactly the excess, never more', () => {
    const ops = Array.from({ length: 20 }, (_, i) => op(`o${i}`, i % 3 === 0 ? 'workout.upsert' : 'coach.plan'));
    assert.equal(capQueue(ops, 12).length, 12);
    assert.equal(capQueue(ops, 20).length, 20);
    assert.equal(capQueue(ops, 1).length, 1);
  });
});

describe('the flush guard', () => {
  const src = () => stripComments(read('src/lib/sync/outbox.ts'));

  it('races every handler against a timeout', () => {
    const body = src();
    assert.match(
      body,
      /withTimeout\(handler\(op\.payload\)/,
      'a handler that never settles must lose a race, not hang the queue — supabase-js sets no ' +
        'default timeout and none of the six handlers passes a signal'
    );
  });

  it('the in-flight flag can expire', () => {
    const body = src();
    assert.match(
      body,
      /flushing && clock\(\) - flushStartedAt < FLUSH_STUCK_MS/,
      '`flushing` is cleared in a finally, which never runs for a promise that never settles — ' +
        'the flag itself has to be able to expire, or one hung fetch kills the tab'
    );
  });

  it('a timed-out handler is an ordinary failure, not a special case', () => {
    // Returning `false` reuses the existing backoff/retry path, so the timeout
    // introduces no new state anywhere else in the module.
    assert.match(src(), /resolve\(false\)/);
  });
});

describe('the service worker cache', () => {
  const sw = () => stripComments(read('app/sw.ts'));

  /**
   * `defaultCache`'s `/api/*` entry is NetworkFirst with a 24-hour max age, so
   * passing it unmodified stored authenticated responses on the device —
   * surviving sign-out, and served to the next user of a shared phone offline.
   * On a school-facing product `/api/school/class/[code]/export` is a CSV of
   * student names and scores.
   */
  it('never caches an API or auth response', () => {
    const body = sw();
    for (const prefix of ['/api/', '/auth/']) {
      assert.ok(
        new RegExp(`startsWith\\('${prefix}'\\)`).test(body),
        `${prefix} must have an explicit NetworkOnly matcher`
      );
    }
    assert.match(body, /new NetworkOnly\(\)/);
    // Order matters: serwist takes the first matching strategy.
    assert.ok(
      body.indexOf("startsWith('/api/')") < body.indexOf('...defaultCache'),
      'the NetworkOnly matchers must come before the defaultCache spread'
    );
  });
});

describe('the cron routes', () => {
  const CRONS = [
    'app/api/cron/nudges/route.ts',
    'app/api/cron/wind-down/route.ts',
    'app/api/cron/day-review/route.ts',
    'app/api/cron/weekly-digest/route.ts',
  ];

  /**
   * These send email serially and mark the batch as sent only after the loop.
   * On Vercel's 10–15 s default the function is killed mid-loop, `markNudged`
   * never runs, and the next daily run re-sends to everyone already emailed.
   */
  it('declare a duration long enough to finish sending', () => {
    for (const file of CRONS) {
      assert.match(
        read(file),
        /export const maxDuration = \d+/,
        `${file} sends email in a loop and would be killed at the platform default, ` +
          'leaving the batch unmarked and re-sending it tomorrow'
      );
    }
  });
});

/**
 * A Postgres message must never reach a client.
 *
 * This check used to `.filter()` a **six-entry `LEAKY` list** over a repo with
 * sixty-nine `route.ts` files — an allowlist wearing the name of a scan, so it
 * could only ever re-check the six routes somebody had already fixed. And its
 * matcher was `/error:\s*error\.message\s*\},\s*\{\s*status:\s*500/`, keyed to
 * one property name and one status code.
 *
 * Both halves failed on the same live defect. `app/api/mobile/workouts/route.ts`
 * returned `{ ...localAck, syncError: error.message }` — a raw Postgres message,
 * at the default **200**. It was not in the list, and it would have passed the
 * regex even if it had been: `syncError`, not `error`; 200, not 500. Exactly the
 * two shapes CLAUDE.md §6 names — *"a name claiming a scope wider than its
 * enumeration"* and *"a guard keyed to one spelling of a defect"* — in one guard,
 * over a rule from §5.
 *
 * So: discover every route, and match `error.message` reaching a response body
 * regardless of property name or status.
 */
describe('server errors', () => {
  /** Every HTTP handler in the app, found rather than listed. */
  function routeFiles(dir = 'app/api', out: string[] = []): string[] {
    for (const entry of readdirSync(path.join(root, dir))) {
      const rel = `${dir}/${entry}`;
      if (statSync(path.join(root, rel)).isDirectory()) routeFiles(rel, out);
      else if (entry === 'route.ts') out.push(rel);
    }
    return out;
  }

  /**
   * A Supabase/Postgres error object reaching `NextResponse.json`, under any key
   * and at any status. Covers `error:`, `syncError:`, shorthand, and template
   * interpolation — the spellings the old single pattern could not see.
   */
  const LEAK = /(?:[A-Za-z_$][\w$]*\s*:\s*|\$\{\s*|\.\.\.[^,}]*,\s*)(?:\w*[Ee]rror)\.message\b/;

  /**
   * Routes allowed to echo a message, each with a written reason. Empty today —
   * kept as the mechanism so the next exception is a reviewable decision rather
   * than a silent edit, in the shape `navTruth.NAV_EXEMPT` uses.
   */
  const LEAK_OK: { file: string; reason: string }[] = [
    {
      file: 'app/api/health/route.ts',
      reason:
        'Deep readiness probe for the founder’s uptime monitor. The Supabase detail is reachable ' +
        'only with `?deep=1` *and* `Authorization: Bearer CRON_SECRET` — the handler 401s before ' +
        'that line otherwise — and it is truncated to 120 chars. Telling an authenticated operator ' +
        'why the database ping failed is the endpoint’s entire purpose; an opaque code here would ' +
        'make the probe useless without protecting anyone.',
    },
  ];

  it('never return the database its own words', () => {
    const files = routeFiles();
    // The old list was six. If discovery ever collapses to something that small
    // again, the guard has stopped guarding and should say so loudly.
    assert.ok(files.length > 50, `only found ${files.length} route files — discovery is broken`);

    const offenders = files.filter((f) => {
      if (LEAK_OK.some((e) => e.file === f)) return false;
      const src = stripComments(read(f));
      // Only the part that gets sent — a `console.error(error.message)` is the
      // correct destination for the detail and must not be flagged.
      return src
        .split('\n')
        .some((line) => !/console\.(error|warn|log)/.test(line) && LEAK.test(line));
    });

    assert.deepEqual(
      offenders,
      [],
      'a Postgres error message names tables, columns and constraints — a free schema map for ' +
        `anyone probing the endpoint. Log it, return an opaque code:\n  ${offenders.join('\n  ')}`
    );
  });

  it('every LEAK_OK row is live and reasoned', () => {
    const files = new Set(routeFiles());
    for (const { file, reason } of LEAK_OK) {
      assert.ok(reason.trim().length > 0, `${file} has no reason`);
      assert.ok(files.has(file), `${file} is exempted but is not a route — the row exempts nothing`);
      assert.ok(
        LEAK.test(stripComments(read(file))),
        `${file} is exempted but no longer leaks — delete the row so the list stays real gaps`
      );
    }
  });

  it('the matcher sees the spellings the old one missed', () => {
    // Falsification in the file: the pattern is asserted against the exact
    // shapes that shipped, so narrowing it back to `error:` + 500 goes red here
    // rather than silently un-guarding sixty-nine routes.
    for (const shape of [
      'return NextResponse.json({ error: error.message }, { status: 500 });',
      'return NextResponse.json({ ...localAck, syncError: error.message });',
      'return NextResponse.json({ detail: dbError.message }, { status: 400 });',
      'return NextResponse.json({ msg: `failed: ${error.message}` });',
    ]) {
      assert.ok(LEAK.test(shape), `matcher does not catch: ${shape}`);
    }
    for (const safe of [
      "return NextResponse.json({ error: 'sync_failed' });",
      'return NextResponse.json({ ok: true });',
    ]) {
      assert.ok(!LEAK.test(safe), `matcher false-positives on: ${safe}`);
    }
  });
});

describe('the teacher PIN', () => {
  /**
   * `verify` rate-limits PIN attempts at 5/minute; `stats`, `leaderboard` and
   * `export` authenticate with the same PIN and had none, so the limit was
   * bypassable by guessing against a sibling. `export` returns the student CSV.
   */
  it('is rate limited inside the shared access gate, not per route', () => {
    const gate = stripComments(read('src/lib/schoolClassAccess.ts'));
    assert.match(
      gate,
      /rateLimitAsync\(`school-pin:/,
      'the limit belongs in resolveTeacherClassAccess so every consumer inherits it — ' +
        'three of its four call sites had no limit at all'
    );
    assert.match(gate, /status:\s*429/, 'a throttled attempt must say so');
  });
});
