import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('JoinClassPage loading text is i18n', () => {
  const src = readFileSync(join(root, 'src/page-components/JoinClassPage.tsx'), 'utf8');
  assert.match(src, /useTranslation/);
  assert.match(src, /joinClassLoading/);
  assert.doesNotMatch(src, />Joining class…</);
});

/**
 * Loop 577 pinned this by English copy, and both copy clauses were vacuous:
 * they read the component's `defaultValue` fallback, which only renders when a
 * key is *missing* from the pack. `builderQuickMobility` has always been in
 * `builderLocales.ts`, so the string users actually see —
 * `'+ Quick Add Free Mobility Warm-up (5 moves)'` — was the one the guard
 * claimed to ban, for as long as the guard has existed. `.834` matched the
 * fallback to the pack (the drift ratchet doing its job) and the contradiction
 * surfaced as a failure.
 *
 * Pin the two things the test's own name claims instead: the CTAs exist (by
 * key, which survives copy edits) and they are 44px. Wanting plainer copy is a
 * pack change, not a guard change.
 */
test('Builder arrange quick-add CTAs are plain 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/builder/BuilderArrangeStep.tsx'),
    'utf8'
  );
  // Each quick-add CTA is checked as a whole <Button>: the key it renders and
  // the 44px class must sit in the *same* element. Asserting them separately
  // passed when one button lost its class and when a key was renamed to a
  // superstring, so both halves are anchored here.
  for (const key of ['builderQuickMobility', 'builderLoadHabitStack'] as const) {
    const call = `t('${key}',`;
    const at = src.indexOf(call);
    assert.notEqual(at, -1, `${key} must render on Builder arrange`);
    const open = src.lastIndexOf('<Button', at);
    assert.notEqual(open, -1, `${key} must render inside a Button`);
    const button = src.slice(open, at);
    assert.match(
      button,
      /min-h-\[44px\] tap-target/,
      `${key}'s Button must carry min-h-[44px] tap-target`
    );
  }
});

test('America CTAs and coach regenerate hold are sized', () => {
  const am = readFileSync(join(root, 'src/page-components/AmericaPage.tsx'), 'utf8');
  assert.match(am, /min-h-\[52px\] tap-target/);

  const manage = readFileSync(
    join(root, 'src/components/coach/CoachManageSheet.tsx'),
    'utf8'
  );
  assert.match(manage, /primary-action min-h-\[52px\]/);
});
