/**
 * The two clock domains, and the one direction data may cross between them.
 *
 * In Strava a logged run is a post. Here a logged set is the **planner's input**:
 * `src/lib/coach/` builds the week from logs alone, with no wearable to
 * cross-check against. Kolnes et al. 2026 (n=225 club runners) found that runners
 * *deleted their own training sessions* when their pace felt slow, and that the
 * behaviour tracked with other-avoidance goals. On Strava that costs some vanity.
 * Here it means the planner prescribes for an athlete who does not exist —
 * deloads that never fire, progression running on a fictional record.
 *
 * So social comparison is not an off-brand tone problem, it is an
 * **input-integrity attack on the core algorithm**, and prose cannot fail a build.
 * `docs/IDENTITY_SOCIAL_PLAN.md` states the standing architecture;
 * `docs/IA_SKELETON.md` states the three product loops. This module states
 * the Log↔Social crossing in a form `domainBoundary.test.ts` can check.
 * Messenger-on-Today is `src/lib/social/isolation.test.ts`.
 *
 * ## Readers and emitters, not import direction
 *
 * The first draft of this contract forbade the Log domain from importing Social at
 * all, and it was wrong on the day it was written: `src/store/workoutStore.ts`
 * imports `applyWorkoutRewards` and calls it when a workout finishes. That is an
 * **emit** — Log telling Social something happened — which is the permitted
 * direction in the architecture's own diagram. A contract that contradicts its
 * diagram gets an exemption bolted on within a week, and an exemption is how a
 * boundary stops being one.
 *
 * The hazard is direction of *data*, not direction of *import*:
 *
 * | Crossing | Verdict |
 * |---|---|
 * | Log **emits** to Social — fire-and-forget, result discarded | permitted |
 * | Log **reads** from Social — rank, points, tier, board position | forbidden |
 *
 * `SOCIAL_EMITTERS` is therefore the one door in the wall, and it is terminal: the
 * guard does not walk through it, because what a reward module does with its own
 * internals is Social's business. What matters is that nothing on the deciding
 * side ever *reads* back.
 *
 * ## Why the walk follows dynamic imports
 *
 * `src/lib/missionJourney.ts` reaches rewards as `void import('@/lib/rewards/apply')`.
 * A static-only guard would be a guard with a hole already in it, in a repo whose
 * hot paths dynamic-import by convention. Depth is unbounded for the same reason
 * `.220` gives: a rule that can only see three hops has only ever tested three hops.
 *
 * Zero imports on purpose (`localeExportManifest.ts`'s rule) — path handling is
 * done with string arithmetic rather than `node:path` so this module is safe to
 * import from anywhere, including a future lint rule or script.
 */

/** Modules that exist to describe an athlete to other people, or to rank them. */
export const SOCIAL_ROOTS = [
  'src/lib/rewards/',
  'src/lib/leaderboard/',
  'src/lib/social/',
  'src/components/rewards/',
  'src/components/leaderboard/',
  'src/components/social/',
] as const;

/**
 * The doors in the wall — **per symbol, not per module**.
 *
 * `leaderboardSync.ts` is why this is a map rather than a list. It exports
 * `scheduleLeaderboardPush` (an emit, called by `workoutStore` when a workout
 * finishes) *and* `fetchCloudLeaderboardSnapshots` (a read, called by
 * `LeaderboardPage`). Declaring the module a door would have quietly licensed the
 * read; declaring it Social outright would have broken a legitimate emit. The
 * honest unit is the export.
 *
 * A door module is **terminal** for the graph walk — what it does with its own
 * internals is Social's business. The symbol restriction is enforced separately,
 * by `reachableFrom` plus a direct source check, which is the precise half.
 */
export const SOCIAL_DOORS: Readonly<Record<string, readonly string[]>> = {
  'src/lib/rewards/apply.ts': [
    'applyRewardEventsLive',
    'applyWorkoutRewards',
    'applyFuelDayReward',
    'applyPillarWinReward',
    'applyJourneyCommissionedReward',
    'applyOneRewardEvent',
  ],
  'src/lib/leaderboardSync.ts': [
    'scheduleLeaderboardPush',
    'registerLeaderboardSyncHandler',
    'pushLeaderboardSnapshot',
  ],
};

export const SOCIAL_DOOR_MODULES = Object.keys(SOCIAL_DOORS);

/**
 * The deciding side. These modules choose what the athlete is told to do next, so
 * they must be blind to standing — including *type* imports, because a planner has
 * no legitimate reason to name a reward type at all.
 */
export const PLANNER_ROOTS = ['src/lib/coach/', 'packages/mw-core/src/'] as const;

/**
 * The set-logging path. Deliberately **not** all of `src/components/workout/`:
 * `WorkoutVictorySheet.tsx` renders `VictoryRewardsLine`, and Victory is the honor
 * beat wave D2 shipped on purpose. Showing an athlete their own earned record after
 * the work is done is the reward; showing it *while they decide whether to log the
 * set* is the pressure. Victory is excluded by design, not by exemption.
 */
export const LOGGER_FILES = [
  'src/store/workoutStore.ts',
  'src/page-components/ActiveWorkoutPage.tsx',
  'src/components/workout/SetLogRow.tsx',
  'src/components/workout/RestTimerBar.tsx',
] as const;

/**
 * Surfaces that sit **after** the moment each contract protects, where showing an
 * athlete their standing is the reward rather than the pressure. Terminal for a
 * Log-domain walk, in the same way a door is — and, like a door, a statement about
 * where the rule ends rather than an exemption from it.
 *
 * - `WorkoutVictorySheet` — the session is over. Wave D2 shipped its reward line on
 *   purpose. It is here because `ActiveWorkoutPage` *renders* Victory: the container
 *   and the honor beat share a route, so a walk from the page reaches
 *   `VictoryRewardsLine` in three hops. Dropping the page from `LOGGER_FILES` would
 *   also have silenced the guard about a leaderboard widget added to the page itself.
 * - `CommissioningCeremony` — journey phase 3, which is precisely where
 *   `CLUB_PLAN.md` unlocks club surfaces. It lives under `src/components/journey/`
 *   and so was swept into the first-run walk, but a ceremony marking the *end* of
 *   the journey is not first run. That was a declaration error, not a breach.
 *
 * Neither may be reached from `PLANNER_ROOTS`, which has no terminals at all.
 */
export const HONOR_TERMINALS = [
  'src/components/workout/WorkoutVictorySheet.tsx',
  'src/components/journey/CommissioningCeremony.tsx',
] as const;

/**
 * First run. `CLUB_PLAN.md` holds club surfaces to journey phase 3, and `.D10`
 * refused community onboarding steps twice; identity is never the price of
 * reaching a first logged set.
 */
export const FIRST_RUN_ROOTS = [
  'src/page-components/WelcomePage.tsx',
  'src/components/journey/',
] as const;

export interface Edge {
  /** Repo-relative path of the importing file. */
  from: string;
  /** The specifier as written, before resolution. */
  spec: string;
  kind: 'static' | 'dynamic';
  /**
   * `import type { … } from` only. An inline `{ type Foo }` counts as a value
   * import here: it is erased too, but reading it correctly means parsing every
   * specifier in the clause, and over-reporting is the safe direction for a
   * boundary. Nothing in the repo relies on the distinction today.
   */
  typeOnly: boolean;
}

const isTestPath = (p: string) => /\.(test|routetest)\.tsx?$/.test(p);

/** Comments describe intent; only code imports anything. Line-preserving. */
export function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
}

/**
 * `import … from '…'` and `export … from '…'` — a re-export is an edge too, and a
 * barrel file is the most natural place for one to hide.
 *
 * The gap between the keyword and `from` is `[^;'"]*?`, which cannot cross a
 * statement terminator or a string. A `[\s\S]*?` there is the lazy-quantifier trap
 * this repo has paid for three times (`.221`, `.223`, `.254`): on
 * `export const x = 1;` it would run past the semicolon and claim the *next*
 * statement's specifier.
 */
const FROM_IMPORT = /(?:^|\n)\s*(import|export)\s+([^;'"]*?)from\s*['"]([^'"]+)['"]/g;

/** Side-effect import — no clause, no `from`. */
const BARE_IMPORT = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;

/** `import('…')`, including the `void import(…).then(…)` shape. */
const DYNAMIC_IMPORT = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Every module specifier `fromFile` reaches directly. Source must be stripped. */
export function importsOf(source: string, fromFile: string): Edge[] {
  const out: Edge[] = [];
  for (const m of source.matchAll(new RegExp(FROM_IMPORT.source, 'g'))) {
    out.push({ from: fromFile, spec: m[3], kind: 'static', typeOnly: /^\s*type\s/.test(m[2]) });
  }
  for (const m of source.matchAll(new RegExp(BARE_IMPORT.source, 'g'))) {
    out.push({ from: fromFile, spec: m[1], kind: 'static', typeOnly: false });
  }
  for (const m of source.matchAll(new RegExp(DYNAMIC_IMPORT.source, 'g'))) {
    out.push({ from: fromFile, spec: m[1], kind: 'dynamic', typeOnly: false });
  }
  return out;
}

function normalize(p: string): string {
  const out: string[] = [];
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return out.join('/');
}

const dirOf = (p: string) => p.slice(0, p.lastIndexOf('/') + 1);

/**
 * A specifier to a repo-relative path, or `null` for anything outside the repo.
 *
 * `tsconfig.json` declares exactly one alias (`@/*` → `./src/*`), so this needs to
 * handle that, relative specifiers, and nothing else — a bare specifier is a
 * package and cannot be a domain crossing.
 */
export function resolveSpecifier(
  spec: string,
  fromFile: string,
  exists: (p: string) => boolean
): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = `src/${spec.slice(2)}`;
  else if (spec.startsWith('./') || spec.startsWith('../')) base = normalize(dirOf(fromFile) + spec);
  else return null;

  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (exists(candidate)) return candidate;
  }
  return null;
}

const under = (file: string, roots: readonly string[]) =>
  roots.some((r) => (r.endsWith('/') ? file.startsWith(r) : file === r));

export interface ReachOptions {
  /**
   * Paths that are permitted destinations **and** terminal — not a hit, and not
   * walked through. The emit door.
   */
  allow?: readonly string[];
  /** Ignore `import type` edges. Off for the planner, which may not name them either. */
  ignoreTypeOnly?: boolean;
}

/**
 * Breadth-first module walk from `entry`. Shared by `reaches` and `reachableFrom`
 * so the two can never disagree about what the Log domain actually touches.
 *
 * Breadth-first rather than depth-first on purpose: the chain reported on a hit is
 * then the *shortest* path to the violation, which is the one a reader can act on.
 */
function walkGraph(
  entry: string,
  read: (file: string) => string | null,
  opts: ReachOptions,
  isTarget: (file: string) => boolean
): { visited: Set<string>; chain: string[] | null } {
  const allow = opts.allow ?? [];
  const visited = new Set<string>([entry]);
  const parent = new Map<string, string>();
  const queue = [entry];

  const chainTo = (hit: string): string[] => {
    const chain = [hit];
    for (let at = hit; parent.has(at); ) {
      at = parent.get(at)!;
      chain.unshift(at);
    }
    return chain;
  };

  while (queue.length) {
    const file = queue.shift()!;
    const source = read(file);
    if (source === null) continue;

    for (const edge of importsOf(stripComments(source), file)) {
      if (opts.ignoreTypeOnly && edge.typeOnly) continue;
      const next = resolveSpecifier(edge.spec, file, (p) => read(p) !== null);
      if (!next || visited.has(next) || isTestPath(next)) continue;

      if (under(next, allow)) continue; // a door: permitted, and not walked through
      if (isTarget(next)) {
        parent.set(next, file);
        return { visited, chain: chainTo(next) };
      }
      visited.add(next);
      parent.set(next, file);
      queue.push(next);
    }
  }
  return { visited, chain: null };
}

/**
 * The shortest chain from `entry` to the first module under `targets`, or `null`.
 *
 * Returning the chain rather than a boolean is the whole ergonomic point: a
 * boundary guard that reports only "violated" sends the next person hunting
 * through a transitive graph by hand.
 */
export function reaches(
  entry: string,
  targets: readonly string[],
  read: (file: string) => string | null,
  opts: ReachOptions = {}
): string[] | null {
  return walkGraph(entry, read, opts, (f) => under(f, targets)).chain;
}

/**
 * Every module `entry` can reach, stopping at doors. This is the Log domain's real
 * closure, and the set the per-symbol door rule has to be checked against — a
 * reader smuggled in three hops away is still a reader on the logging path.
 */
export function reachableFrom(
  entry: string,
  read: (file: string) => string | null,
  opts: ReachOptions = {}
): Set<string> {
  return walkGraph(entry, read, opts, () => false).visited;
}

/**
 * Symbols imported from `module` by `source`, covering both the static clause and
 * the `const { x } = await import('…')` shape that `pillarLog.ts` uses. Source must
 * be stripped; `resolve` maps a specifier to a repo-relative path.
 */
export function doorSymbolsUsed(
  source: string,
  fromFile: string,
  module: string,
  resolve: (spec: string, from: string) => string | null
): string[] {
  const names: string[] = [];
  const clauses = [
    /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g,
    /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*await\s+import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of clauses) {
    for (const m of source.matchAll(re)) {
      if (resolve(m[2], fromFile) !== module) continue;
      for (const raw of m[1].split(',')) {
        const name = raw.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, '').trim();
        if (name) names.push(name);
      }
    }
  }
  // `import('…').then((m) => m.applyX())` — the symbol is reached off the module
  // object. Bounded by `;` rather than a character budget: a fixed `[\s\S]{0,200}`
  // window ran past the end of `missionJourney.ts:130` and harvested two method
  // calls from the *next* two statements, which is `.254`'s lazy-quantifier defect
  // wearing a different hat. The statement terminator is the real edge.
  for (const m of source.matchAll(
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.\s*then\s*\(([^;]*)/g
  )) {
    if (resolve(m[1], fromFile) !== module) continue;
    for (const use of m[2].matchAll(/\.\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (use[1] !== 'then' && use[1] !== 'catch') names.push(use[1]);
    }
  }
  return [...new Set(names)];
}

/**
 * Is the call at `index` a bare expression statement — its result thrown away?
 *
 * Scans back to the previous statement boundary and requires only whitespace (or
 * `void`) in between, rather than testing what precedes the call with a lookahead.
 * `/\s*(?!const)/` and its cousins do not work: `\s*` backtracks to zero width and
 * the lookahead is then evaluated against a space. That exact defect is written up
 * twice already, in `check-design-system.mjs` and `launchTruth.test.ts`.
 */
export function callIsDiscarded(source: string, index: number): boolean {
  const before = source.slice(0, index);
  const boundary = Math.max(
    before.lastIndexOf(';'),
    before.lastIndexOf('{'),
    before.lastIndexOf('}')
  );
  const gap = before.slice(boundary + 1);

  // `=>` before testing for assignment, or every arrow callback reads as a binding.
  const noArrows = gap.replace(/=>/g, '');
  if (/\breturn\b/.test(noArrows)) return false;
  if (/[^=!<>]=(?!=)/.test(noArrows)) return false;

  // Nested inside another call — the value is being consumed as an argument.
  // Skipped for the `import(…).then(cb)` shape, where the unclosed paren belongs to
  // `.then` and the promise itself is what gets voided.
  if (!/\bimport\s*\(/.test(gap)) {
    const opens = (noArrows.match(/\(/g) ?? []).length;
    const closes = (noArrows.match(/\)/g) ?? []).length;
    if (opens > closes) return false;
  }
  return true;
}
