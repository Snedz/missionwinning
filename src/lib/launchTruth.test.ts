/**
 * Numbers the launch decision rests on.
 *
 * `.223`. Three defects, one shape: a quantity reached a surface that mattered
 * while nothing checked it could be right.
 *
 *   - **`allBasicDone` was defined twice, with opposite bodies.**
 *     `missionJourney.ts` returned `b.workout` — Horizon W's "Basic Training =
 *     first workout only" — and `betaMetricsServer.ts` kept a private copy
 *     requiring all five pillars. The server copy is the one that computes
 *     `basicCompletePct`, and `launchReady` gates on it at ≥60. So a tester who
 *     did everything the product asks read as *incomplete* on the founder's
 *     dashboard, and the gate that decides "are ten beta users ready" could not
 *     go green regardless of how well the beta went.
 *   - **`weekRecap` counted deleted sessions**, while `dayReview.ts` and
 *     `behaviorImpacts.ts` both drop tombstones. Those counts are not confined to
 *     a screen: `buildRecapCardData` prints them onto a PNG shared publicly.
 *   - **`weeklyDebrief.prs` came from a field nothing writes.** Always 0, so the
 *     recap card's PR line and the Today card's "N PR marks this week" were dead
 *     on arrival — and the guard covering them supplied `prs: 2` by hand, proving
 *     the formatting while blind to the input never existing.
 *
 * The rules below follow the facts rather than the shapes those facts had on the
 * day they were written — `.220`'s lesson, where a guard named "both streak
 * readers" while iterating two hardcoded files and there were four.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { allBasicDone } from '@/lib/journey/basicComplete';
import { buildWeekRecap } from '@/lib/weekRecap';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const isTest = (p: string) => /\.(test|routetest)\.tsx?$/.test(p);
const PRODUCT_SOURCE = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
  (p) => !isTest(p)
);

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/* ── One definition, discovered rather than listed ───────────────────────── */

/**
 * The general rule, not the instance.
 *
 * Fixing the two `allBasicDone` bodies and moving on would leave the next pair to
 * be found the same way — by noticing a dashboard number refusing to move. So
 * this walks every source file and fails when one name carries two different
 * function bodies, which is `.178` stated executably.
 *
 * Scoped to *declared functions* rather than every identifier: local helpers with
 * the same name in different modules are ordinary, but two of them named the same
 * thing and doing different things is how a word starts meaning two things.
 */
test('no domain rule is stated twice with two different answers', () => {
  const bodies = new Map<string, Map<string, string[]>>();

  for (const file of PRODUCT_SOURCE) {
    const src = stripComments(read(file));
    /*
     * Only functions that take a **project** type.
     *
     * The first draft flagged any repeated name and returned eighteen hits, nearly
     * all of them fine: `clamp`, `num`, `formatDuration`, and Next's own
     * `generateStaticParams`/`generateMetadata`, which every dynamic route is
     * *required* to define. A guard that needs an eighteen-entry allowlist is an
     * allowlist wearing a guard's name.
     *
     * What made `allBasicDone` dangerous was not the repeated name — it was that
     * both copies answered a question about `JourneyBasicMilestones`, a type this
     * repo defines and both files import. Two functions deciding the same thing
     * about the same domain object is the `.178` shape; two helpers both called
     * `clamp` is not.
     */
    const domainTypes = new Set(
      [...src.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'@\//g)]
        .flatMap((m) => m[1].split(','))
        .map((s) => s.replace(/^\s*type\s+/, '').trim())
        .filter((s) => /^[A-Z]/.test(s))
    );
    /*
     * A type can reach a signature without ever appearing in an import statement:
     * `b: import('@/lib/missionJourney').JourneyBasicMilestones` is a project type
     * with no `import … from` line to harvest. The second falsification mutant used
     * exactly that and walked past the first two versions of this rule.
     */
    for (const m of src.matchAll(/import\('@\/[^']*'\)\.([A-Za-z_$][\w$]*)/g)) {
      domainTypes.add(m[1]);
    }
    /*
     * Parameters are read by balancing parentheses, not by `\(([^)]*)\)`.
     *
     * A falsification mutant escaped that version by writing the type inline:
     * `function allBasicDone(b: import('@/lib/missionJourney').JourneyBasicMilestones)`.
     * The `)` closing `import(` ended the capture early, the domain type never
     * appeared in the truncated string, and the fork went unnoticed. A guard that
     * a legal way of spelling the same signature can walk past is not a guard.
     */
    const re = /(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const name = m[1];
      let p = m.index + m[0].length - 1;
      let pDepth = 0;
      const pStart = p;
      for (; p < src.length; p++) {
        if (src[p] === '(') pDepth++;
        else if (src[p] === ')') {
          pDepth--;
          if (pDepth === 0) break;
        }
      }
      const params = src.slice(pStart + 1, p);
      const brace = src.indexOf('{', p);
      if (brace === -1) continue;
      const touchesDomain = [...domainTypes].some((t) => new RegExp(`\\b${t}\\b`).test(params));
      if (!touchesDomain) continue;
      // Balance braces from the body's opening one to capture it exactly.
      let depth = 0;
      let i = brace;
      const start = i;
      for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') {
          depth--;
          if (depth === 0) break;
        }
      }
      const body = src.slice(start + 1, i).replace(/\s+/g, ' ').trim();
      if (!body) continue;
      if (!bodies.has(name)) bodies.set(name, new Map());
      const byBody = bodies.get(name)!;
      if (!byBody.has(body)) byBody.set(body, []);
      byBody.get(body)!.push(file);
    }
  }

  const conflicts = [...bodies.entries()]
    .filter(([, byBody]) => byBody.size > 1)
    .map(([name, byBody]) => `${name} (${[...byBody.values()].map((f) => f[0]).join(' vs ')})`);

  assert.deepEqual(
    conflicts,
    [],
    'one name, two answers, one domain type — the shape that made the launch gate unreachable'
  );
});

/* ── The launch gate measures what the product implements ────────────────── */

test('the founder dashboard imports the basic-complete rule rather than restating it', () => {
  /*
   * The defect was not that the server was wrong — it was that the server had its
   * own copy at all, so the two could drift without anything noticing. This checks
   * the structural fix, because the value check below cannot see a future re-fork.
   *
   * `.262` — it used to assert one literal import line in `betaMetricsServer.ts`,
   * and legitimately extracting the aggregation into `beta/funnelAggregate.ts`
   * turned it red: the rule was still imported exactly once, just one hop further
   * along. That is this repo's own `.212`/`.220` shape appearing in a guard —
   * keyed to a spelling rather than to the property it names — so it now **follows
   * the path** instead, and separately **discovers** redefinitions across the
   * whole tree rather than checking the one file that forked last time.
   */
  const LOCAL_IMPORT = /from\s+'(@\/lib\/[^']+)'/g;
  const IMPORTS_RULE = /import\s*\{[^}]*\ballBasicDone\b[^}]*\}\s*from\s*'@\/lib\/journey\/basicComplete'/;

  const resolve = (spec: string) => `src/lib/${spec.replace('@/lib/', '')}.ts`;

  /** Does this module reach the one true rule directly, or through one it imports? */
  function reachesRule(file: string, depth = 0): boolean {
    let src: string;
    try {
      src = stripComments(read(file));
    } catch {
      return false;
    }
    if (IMPORTS_RULE.test(src)) return true;
    if (depth >= 3) return false;
    for (const m of src.matchAll(LOCAL_IMPORT)) {
      if (reachesRule(resolve(m[1]), depth + 1)) return true;
    }
    return false;
  }

  assert.ok(
    reachesRule('src/lib/betaMetricsServer.ts'),
    "the founder dashboard's Basic-complete answer no longer traces to " +
      '@/lib/journey/basicComplete — that is how `.223` happened: the gate scored testers ' +
      'against a rule the app had stopped implementing.'
  );

  // And nobody anywhere gets to answer the question a second time.
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(e.name) && !/\.(test|routetest)\.tsx?$/.test(e.name)) {
        if (/function\s+allBasicDone|const\s+allBasicDone\s*=/.test(stripComments(read(rel)))) {
          offenders.push(rel);
        }
      }
    }
  };
  walk('src');
  walk('app');

  assert.deepEqual(
    offenders,
    ['src/lib/journey/basicComplete.ts'],
    'allBasicDone must be defined in exactly one place. A local redefinition is how the ' +
      'launch gate started measuring a rule the app had dropped:\n  ' + offenders.join('\n  ')
  );
});

test('Basic Training is the first workout, and the other pillars do not gate it', () => {
  // The Horizon W rule itself, so a silent widening fails here and not in a
  // dashboard percentage six weeks later.
  assert.equal(allBasicDone({ workout: true, fuel: false, move: false, mind: false, learn: false }), true);
  assert.equal(allBasicDone({ workout: false, fuel: true, move: true, mind: true, learn: true }), false);
});

/* ── Deleted sessions are not achievements ───────────────────────────────── */

function log(daysAgo: number, over: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  const at = new Date();
  at.setDate(at.getDate() - daysAgo);
  return {
    id: `w${daysAgo}${over.deletedAt ? 'd' : ''}`,
    workoutName: 'Session',
    startedAt: at.toISOString(),
    completedAt: at.toISOString(),
    durationSeconds: 1800,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    totalVolume: 500,
    ...over,
  };
}

test('a deleted session does not reach the recap, and so does not reach the share card', () => {
  const now = new Date();
  // Anchor inside the current week so the date filter is not what is under test.
  const live = buildWeekRecap([log(0)], now);
  const withTombstone = buildWeekRecap([log(0), log(0, { deletedAt: now.toISOString() })], now);

  assert.equal(withTombstone.sessions, live.sessions, 'a tombstone inflated the session count');
  assert.equal(withTombstone.totalVolume, live.totalVolume, 'a tombstone inflated volume');
  assert.equal(withTombstone.totalSets, live.totalSets, 'a tombstone inflated sets');
});

test('every reader that reports a training number drops tombstones', () => {
  /*
   * Discovered, not listed. `weekRecap` was the third reader of `history` and the
   * only one that forgot — naming the three that exist today would pass the day
   * the fourth is written.
   */
  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    const src = stripComments(read(file));
    // Files that filter workout history by date are making a claim about a window.
    if (!/completedAt\s*\|\|\s*[\w.]*startedAt/.test(src)) continue;
    if (!/deletedAt/.test(src)) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    'this file windows workout history without excluding deleted logs'
  );
});

/* ── A number with no source does not get a surface ──────────────────────── */

test('nothing reads a field through a cast that the type does not declare', () => {
  /*
   * `weeklyDebrief` read `(log as { personalRecords?: number }).personalRecords`.
   * The cast is the whole defect: it is a hand-written instruction to the compiler
   * to stop checking, and behind it sat a field no code in the repo writes, so a
   * PR line and a Today row were permanently unreachable.
   *
   * Narrow on purpose — this catches an inline object cast that invents a property
   * on a value, which is the shape that hid it. A cast to a declared named type is
   * ordinary and not flagged.
   *
   * The exemptions are all one thing: **shapes this repo receives and never
   * produces.** An inline cast is the correct way to read an xAI completion or an
   * Open Food Facts response, and "nothing in `src/` writes this field" is exactly
   * what you would expect there. It is only a defect when the value being narrowed
   * is one of ours, because then the missing writer means the feature is dead.
   */
  const EXTERNAL: Record<string, { why: string; fixWhen: string }> = {
    'src/lib/coachLlmClient.ts': {
      why: 'OpenAI-compatible completion envelope from the coach LLM provider',
      fixWhen: 'the provider response gets a declared type in src/types',
    },
    'src/lib/mealVisionClient.ts': {
      why: 'same completion envelope, vision variant',
      fixWhen: 'as above',
    },
    'src/lib/openFoodFacts.ts': {
      why: 'Open Food Facts search response',
      fixWhen: 'that API ships types worth pinning',
    },
    'src/lib/paypalWebhook.ts': {
      why: 'PayPal webhook verification response',
      fixWhen: 'never — vendor-owned shape',
    },
    'app/api/paypal-webhook/route.ts': {
      why: 'the payer block of a PayPal event body, same vendor shape one layer up',
      fixWhen: 'never — vendor-owned shape',
    },
    'src/lib/playBilling.ts': {
      why: 'Google service-account credential JSON',
      fixWhen: 'never — vendor-owned shape',
    },
    'src/lib/healthImport.ts': {
      why: 'Apple Health / Google Fit export payloads, both third-party',
      fixWhen: 'never — vendor-owned shape',
    },
    'src/lib/presidentialFitnessTest.ts': {
      why: 'PFT age-band table read from bundled data, not written by app code',
      fixWhen: 'the table moves into a typed module',
    },
    'src/lib/storage/safeStorage.ts': {
      why: 'narrowing `window` to probe for localStorage — a DOM shape',
      fixWhen: 'never',
    },
    'src/lib/storage/safeSessionStorage.ts': {
      why: 'narrowing `window` to probe for sessionStorage — a DOM shape',
      fixWhen: 'never',
    },
  };

  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    if (EXTERNAL[file]) continue;
    const src = stripComments(read(file));
    const re = /\bas\s*\{\s*(\w+)\s*\??\s*:/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const field = m[1];
      const written = PRODUCT_SOURCE.some((other) => {
        if (other === file) return false;
        return new RegExp(`\\b${field}\\s*:`).test(stripComments(read(other)));
      });
      if (!written) offenders.push(`${file}: ${field}`);
    }
  }
  assert.deepEqual(offenders, [], 'a cast invented a field nothing writes');

  // `.202`: a stale exemption is a rule that quietly stopped being enforced.
  const stale = Object.keys(EXTERNAL).filter(
    (f) => !/\bas\s*\{\s*\w+\s*\??\s*:/.test(stripComments(read(f)))
  );
  assert.deepEqual(stale, [], 'this file no longer casts — drop its exemption');
});

test('the recap card offers no PR line while nothing can supply one', () => {
  /*
   * The cross-check that would have caught it: the claim on the card and the
   * existence of its input, asserted together. `isPr` is computed by
   * `isPersonalRecord` and stored on the *active* set — but
   * `CompletedWorkoutLog.exercises[].sets` does not declare it, so the flag is
   * dropped at completion and a week's records are not on the record.
   *
   * When that changes, this test fails, and it should: the PR line can come back.
   */
  const types = stripComments(read('src/types/index.ts'));
  const completed = types.slice(types.indexOf('interface CompletedWorkoutLog'));
  const setsLine = /sets:\s*\{([^}]*)\}/.exec(completed)?.[1] ?? '';
  const persisted = /\bisPr\b/.test(setsLine);

  const card = stripComments(read('src/lib/share/shareCard.ts'));
  const recap = card.slice(card.indexOf('export function buildRecapCardData'));
  /*
   * The value is captured and tested in code, not excluded by a lookahead.
   * `/prLine:\s*(?!null)/` reads correctly and is wrong: `\s*` backtracks to zero
   * width, the lookahead is then evaluated against the space, and `prLine: null`
   * matches as if it were a claim. `.221` hit this exact backtrack on
   * `border-radius: 0` and wrote it down; I reproduced it here anyway.
   */
  const prValue = /prLine:\s*([^,\n]+)/.exec(recap.slice(0, recap.indexOf('\n}')))?.[1]?.trim();
  const claimsPr = prValue !== undefined && prValue !== 'null';

  assert.equal(
    claimsPr,
    persisted,
    persisted
      ? 'isPr now survives completion — the recap card may print records again'
      : 'the card would print a PR count from a flag that is discarded at completion'
  );
});
