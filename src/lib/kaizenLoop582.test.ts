import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('N1 integrity: critical surfaces have no corrupt onClick className pattern', () => {
  const files = [
    'src/components/coach/CoachTodayCard.tsx',
    'src/components/today/TodayProgressSection.tsx',
    'src/components/track/BodyMetricsCard.tsx',
    'src/components/form/FormGuideSheet.tsx',
    'src/components/library/LibraryDetailSheet.tsx',
  ];
  for (const rel of files) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(src, /onClick=\{\(\) = className/, rel);
  }
});

test('FormGuideSheet ready position and media captions are i18n', () => {
  const src = readFileSync(join(root, 'src/components/form/FormGuideSheet.tsx'), 'utf8');
  assert.match(src, /formGuideReadyPosition/);
  assert.match(src, /formGuideCaptionVideo/);
  assert.match(src, /formGuideStillAlt/);
  assert.doesNotMatch(src, /militaryStyle \? 'Ready position'/);
  assert.doesNotMatch(src, /label="Captions"/);
});

test('Library detail overlay is not given button min-h; nav chips tap-target', () => {
  const src = readFileSync(
    join(root, 'src/components/library/LibraryDetailSheet.tsx'),
    'utf8'
  );
  assert.doesNotMatch(
    src,
    /AdaptiveOverlay[\s\S]{0,80}size="sm"[\s\S]{0,40}className="min-h-\[44px\] tap-target"/
  );
  assert.match(src, /house-btn house-btn-ghost min-h-\[44px\] min-w-\[44px\] tap-target/);
  assert.doesNotMatch(src, /border-2 px-2 tap-target/);
});

test('File upload remove control is 44px', () => {
  const src = readFileSync(join(root, 'src/components/ui/FileUploadRow.tsx'), 'utf8');
  assert.match(src, /min-h-\[44px\] min-w-\[44px\]/);
  assert.match(src, /uploadRemove/);
});
