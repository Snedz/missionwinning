import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Profile assessment card is i18n-backed', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfileAssessmentCard.tsx'),
    'utf8'
  );
  assert.match(src, /profileAssessmentTitle/);
  assert.match(src, /profileAssessmentLast/);
  assert.match(src, /profileAssessmentHint/);
  assert.match(src, /profileAssessmentFoot/);
  assert.doesNotMatch(src, /<CardTitle>Readiness Assessment<\/CardTitle>/);
  assert.doesNotMatch(src, /Core free forever\. Premium adds history, deeper/);
});

test('Profile owner tools demo feet use t()', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfileOwnerTools.tsx'),
    'utf8'
  );
  assert.match(src, /ownerToolsBundleFoot/);
  assert.match(src, /ownerToolsShareFoot/);
  assert.match(src, /ownerToolsEventsFoot/);
  assert.doesNotMatch(src, /Track real via Supabase later/);
});

test('Military readiness section is i18n-backed', () => {
  const src = readFileSync(
    join(root, 'src/components/benchmarks/MilitaryReadinessSection.tsx'),
    'utf8'
  );
  assert.match(src, /militaryReadinessTitle/);
  assert.match(src, /useTranslation/);
  assert.doesNotMatch(src, />Readiness test prep</);
});

test('Programs empty copy is plain', () => {
  const src = readFileSync(join(root, 'src/page-components/ProgramsPage.tsx'), 'utf8');
  assert.match(src, /Nothing matches\. Clear filters/);
  assert.match(src, /programsShareFeedback/);
});
