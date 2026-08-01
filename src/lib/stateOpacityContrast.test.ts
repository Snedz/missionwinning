/**
 * Opacity is not a state treatment. It is a contrast reduction.
 *
 * `.236` — `/coach` failed the a11y gate at **2.97:1**, and the cause was one
 * class:
 *
 * ```tsx
 * // PlanSessionCard.tsx, before
 * session.status === 'missed' && 'opacity-60',
 * ```
 *
 * Container opacity composites every descendant toward the ground, so dimming a
 * card dims its text with it. `bg-neutral-200 text-neutral-800` is a legible
 * pairing on its own; at 60% over paper it is `#8a8888` on `#eeebeb`, less than
 * two thirds of the required ratio.
 *
 * `WeekStrip.tsx:85` had already reached this conclusion and written it down —
 * *"Quieter via border + no glyph, not opacity — dimming the container also dims
 * the day label past 4.5:1 at 10px"* — for the missed cell of the very same
 * plan, three files away. One concept, two treatments, one of them wrong
 * (`.178`). A rule that lives in a comment protects the file it is in.
 *
 * **Why axe did not already cover this.** Both offenders render only in states
 * the a11y suite never reaches. The missed card needed `.207`, which fixed the
 * bug where no session was ever marked missed — so this markup was unreachable
 * for as long as it was wrong. And `MuscleHeatmap`'s percentage renders only
 * when `cell.intensity > 0`, while the suite seeds onboarding with no history.
 * `/history` is in `GATED_ROUTES` and passes with the element absent. A route in
 * the list is not the same as the states on that route being covered — which is
 * the whole reason this check reads source rather than waiting for a render.
 *
 * The rule: no **bare** `opacity-{40,50,60,70,80}` in component source.
 *
 * Prefixed variants are out of scope on purpose. `disabled:opacity-50` is the
 * shadcn idiom and WCAG 1.4.3 explicitly exempts disabled controls;
 * `hover:`/`group-`/`data-[…]:` are transient or duplicate an accessible state
 * that is already conveyed some other way. What is dangerous is the unprefixed
 * kind, which is on the element for as long as the element exists.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const ROOTS = ['src/components', 'src/page-components'];

/** Matches `opacity-40` … `opacity-80` only when nothing prefixes it. */
const BARE_OPACITY = /(^|[\s'"`{(])(opacity-(?:40|50|60|70|80))\b/g;

/**
 * Bare opacity that is **not** a contrast risk, each with the reason.
 *
 * Two shapes qualify: the element carries no text at all, or its text is
 * deliberately unreadable and stated in words elsewhere. "It looks better"
 * does not qualify — that is the argument the two defects above were shipped
 * on.
 */
const NOT_TEXT: { file: string; why: string }[] = [
  {
    file: 'src/components/ui/FileUploadRow.tsx',
    why: 'A progress bar at `w-0` while queued — the element has zero width and no text node, so there is nothing for the opacity to reduce the contrast of.',
  },
  {
    file: 'src/components/ui/select.tsx',
    why: 'The ChevronDown affordance on the trigger. A decorative icon duplicating information the control already conveys; WCAG 1.4.11 exempts purely decorative graphics, and no text is inside it.',
  },
  {
    file: 'src/components/ui/dialog.tsx',
    why: 'The close X, at opacity-70 with hover:opacity-100. An icon with no text node, and its accessible name comes from the sr-only label rather than anything the opacity touches.',
  },
  {
    file: 'src/components/mind/MindLockedPreview.tsx',
    why: 'A locked premium preview, blurred by design at `blur-[1px]` alongside the opacity. The content is meant to be unreadable — that is the paywall — and what the athlete needs to read is the unlocked copy outside this element.',
  },
  {
    file: 'src/components/learn/LearnLockedPreview.tsx',
    why: 'Same paywall shape as MindLockedPreview: `pointer-events-none select-none opacity-60 blur-[1px]`. Deliberately unreadable premium chapters, with the actual offer stated in full-contrast copy outside the blurred block.',
  },
  {
    file: 'src/components/move/MoveLockedPreview.tsx',
    why: 'Same paywall shape — a blurred recovery meter behind `blur-[1px]`, with the unlock copy at full contrast outside it. Nothing inside is meant to be legible.',
  },
  {
    file: 'src/components/nutrition/FuelLockedPreview.tsx',
    why: 'Same paywall shape — a blurred sample fuel day behind `blur-[1px]`. The readable version of this information is what the athlete is being offered, so making it legible here would defeat the component.',
  },
  {
    file: 'src/components/track/TrackGpsLockedPreview.tsx',
    why: 'Same paywall shape, and its blurred child is a pace chart rather than text — `TrackPaceChart` renders an SVG with no text node for the opacity to dim.',
  },
  {
    file: 'src/components/ui/FileDropZone.tsx',
    why: 'The disabled state of the drop zone. It is a div rather than a form control so it cannot use the `disabled:` variant the primitives use, but it is the same thing: WCAG 1.4.3 exempts inactive user interface components, and `pointer-events-none` on the same line makes it genuinely inactive.',
  },
  {
    file: 'src/page-components/PressPage.tsx',
    why: 'A background photograph in an `aria-hidden` `pointer-events-none` layer behind the hero. It carries no text; the wordmark and copy sit in a sibling at `z-[1]` and are unaffected.',
  },
];

function tsxFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(rel);
      else if (entry.name.endsWith('.tsx')) out.push(rel);
    }
  };
  ROOTS.forEach(walk);
  return out;
}

/** Source with comments removed — this file's own prose quotes every class it bans. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[^\n'"`]*\/\/.*$/gm, '');
}

test('the scan reads real components', () => {
  /*
   * A walker that returns nothing passes every assertion below, which would be
   * a poor thing to ship in a file about checks that cannot fail.
   */
  const files = tsxFiles();
  assert.ok(files.length >= 100, `walked only ${files.length} .tsx files — the walker broke`);

  // The regex has to actually match the shape it bans, or the rule is decorative.
  const sample = `className={cn('flex', done && 'opacity-60', 'p-2')}`;
  assert.deepEqual(
    [...sample.matchAll(BARE_OPACITY)].map((m) => m[2]),
    ['opacity-60']
  );
  // …and has to leave the prefixed forms alone, or every shadcn primitive fails.
  for (const ok of ['disabled:opacity-50', 'hover:opacity-70', 'group-hover:opacity-60']) {
    assert.deepEqual([...ok.matchAll(BARE_OPACITY)].map((m) => m[2]), [], ok);
  }
});

test('no component dims itself into a contrast failure', () => {
  const exempt = new Set(NOT_TEXT.map((e) => e.file));

  const offenders: string[] = [];
  for (const file of tsxFiles()) {
    if (exempt.has(file)) continue;
    const src = stripComments(readFileSync(path.join(root, file), 'utf8'));
    const hits = [...src.matchAll(BARE_OPACITY)].map((m) => m[2]);
    if (hits.length) offenders.push(`${file}: ${[...new Set(hits)].join(', ')}`);
  }

  assert.deepEqual(
    offenders,
    [],
    'these dim an element that carries text, which reduces its contrast with it. Use a ' +
      'border, a surface change, or weight — WeekStrip.tsx:85 is the worked example. If the ' +
      'element genuinely has no readable text, add it to NOT_TEXT with the reason:\n  ' +
      offenders.join('\n  ')
  );
});

test('every exemption states a reason', () => {
  for (const e of NOT_TEXT) {
    assert.ok(e.why.trim().length > 60, `${e.file}: "${e.why}" is not a reason`);
  }
});

test('no exemption is stale', () => {
  /*
   * `.220`'s direction. An entry for a file that no longer has bare opacity
   * makes the list look considered, and quietly re-permits the class the day
   * someone adds one back to that file.
   */
  const stale = NOT_TEXT.filter((e) => {
    let src: string;
    try {
      src = stripComments(readFileSync(path.join(root, e.file), 'utf8'));
    } catch {
      return true; // file gone
    }
    return [...src.matchAll(BARE_OPACITY)].length === 0;
  }).map((e) => e.file);

  assert.deepEqual(stale, [], 'these no longer use bare opacity — remove their exemptions');
});

test('the two components this was written about are fixed, not exempted', () => {
  /*
   * Named because they are the evidence. `PlanSessionCard` is the one the gate
   * actually caught at 2.97:1; `MuscleHeatmap` is the one arithmetic caught
   * that no test could — `text-accent-900` on `bg-accent-400` is 6.93:1 at full
   * strength and 3.76:1 at 70%, on the highest-volume muscle group.
   */
  const exempt = new Set(NOT_TEXT.map((e) => e.file));
  for (const file of [
    'src/components/coach/PlanSessionCard.tsx',
    'src/components/history/MuscleHeatmap.tsx',
  ]) {
    assert.ok(!exempt.has(file), `${file} was exempted rather than fixed`);
  }

  /*
   * `stripComments`, and it is not a nicety.
   *
   * A mutant that deleted the `<Badge>` rendering `coachSessionMissed` left this
   * test **green**, because the comment sitting directly above the badge quotes
   * the key by name — the assertion matched the prose explaining the code
   * instead of the code. Third time in this programme (`.221`, `.233`, `.235`),
   * always in a guard whose own commentary is thorough enough to satisfy it.
   */
  const card = stripComments(
    readFileSync(path.join(root, 'src/components/coach/PlanSessionCard.tsx'), 'utf8')
  );

  // The missed card must still be distinguishable, or "fixed the contrast" just
  // means the state stopped being visible at all.
  assert.match(
    card,
    /status === 'missed' && '[^']*border/,
    'the missed card no longer carries a visible treatment'
  );
  assert.match(
    card,
    /coachSessionMissed/,
    'the missed state must be in words too — opacity said nothing to a screen reader, and ' +
      'neither does a border'
  );
});
