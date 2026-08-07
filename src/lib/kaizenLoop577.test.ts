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

test('Builder arrange quick-add CTAs are plain 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/builder/BuilderArrangeStep.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] tap-target/);
  assert.match(src, /Add mobility warm-up/);
  assert.doesNotMatch(src, /Quick Add Free Mobility Warm-up/);
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
