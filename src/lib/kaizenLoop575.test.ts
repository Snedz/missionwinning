import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('SignInPanel OAuth and magic-link UI is i18n + hit targets', () => {
  const src = readFileSync(join(root, 'src/components/auth/SignInPanel.tsx'), 'utf8');
  assert.match(src, /useTranslation/);
  assert.match(src, /signInGoogle|signInApple/);
  assert.match(src, /signInDifferentEmail/);
  assert.match(src, /signInOrEmail/);
  assert.doesNotMatch(src, />Continue with Google</);
  assert.doesNotMatch(src, />Use a different email</);
  assert.match(src, /min-h-\[52px\]/);
});

test('HoldToConfirmButton hold hints are i18n', () => {
  const src = readFileSync(
    join(root, 'src/components/ui/HoldToConfirmButton.tsx'),
    'utf8'
  );
  assert.match(src, /holdConfirmAgain/);
  assert.match(src, /holdConfirmHint/);
  assert.match(src, /useTranslation/);
});

test('Coach manage regenerate hold is 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/coach/CoachManageSheet.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] tap-target/);
});
