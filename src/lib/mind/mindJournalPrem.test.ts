import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, flowTotalDurationSec, getContentInventory } from '@/lib/contentInventory';
import { PREMIUM_MIND_SESSION_COUNT } from '@/data/premiumInventory';
import { MIND_COLLECTIONS } from '@/lib/mind/filterSessions';

const root = join(import.meta.dirname, '..', '..', '..');

const JOURNAL_IDS = [
  'journal-session-size',
  'journal-missed-day',
  'journal-sleep-data',
  'journal-after-heavy',
  'journal-travel-plan-b',
  'journal-feed-vs-program',
  'journal-one-cue',
  'journal-week-close',
] as const;

const FORBIDDEN =
  /streak|Calm|Headspace|Waking Up|sleep stor|diagnos|depress|therap|SSRI|PTSD|disorder|suicid|clinical/i;

function premiumSrc(): string {
  return readFileSync(join(root, 'src/data/premiumMindSessions.ts'), 'utf8');
}

function blockForId(src: string, id: string): string {
  const start = src.indexOf(`id: '${id}'`);
  assert.ok(start >= 0, `missing session ${id}`);
  const next = src.indexOf(`id: '`, start + 1);
  const end = next === -1 ? src.indexOf('\n];', start) : next;
  return src.slice(start, end);
}

function parseSession(block: string, id: string) {
  const title = /title:\s*'((?:\\'|[^'])*)'/.exec(block)?.[1];
  const minutes = Number(/minutes:\s*(\d+)/.exec(block)?.[1]);
  const tags =
    /tags:\s*\[([^\]]+)\]/
      .exec(block)?.[1]
      .split(',')
      .map((s) => s.replace(/['\s]/g, ''))
      .filter(Boolean) ?? [];
  const steps = [...block.matchAll(/\{\s*text:\s*'((?:\\'|[^'])*)',\s*durationSec:\s*(\d+)/g)].map(
    (m) => ({ text: m[1].replace(/\\'/g, "'"), durationSec: Number(m[2]) })
  );
  assert.ok(title, id);
  return { id, title: title!, minutes, tags, steps };
}

test('journal premium pack is eight original question sessions', () => {
  const src = premiumSrc();
  const allIds = [...src.matchAll(/^\s*id:\s*'([^']+)'/gm)].map((m) => m[1]);
  assert.equal(new Set(allIds).size, allIds.length, 'duplicate premium ids');
  assert.equal(allIds.length, 68);
  assert.equal(PREMIUM_MIND_SESSION_COUNT, 68);
  assert.equal(CONTENT_FLOORS.mindPremium, 68);
  assert.equal(getContentInventory().mind.premium, 68);

  for (const id of JOURNAL_IDS) {
    assert.equal(allIds.filter((x) => x === id).length, 1, id);
    const s = parseSession(blockForId(src, id), id);
    assert.ok(s.tags.includes('journal'), id);
    assert.ok(s.tags.length >= 2, id);
    assert.ok(s.steps.length >= 4, id);
    assert.ok(s.minutes >= 4 && s.minutes <= 6, id);
    const questions = s.steps.filter((st) => st.text.includes('?'));
    assert.ok(questions.length >= 2, `${id} needs ≥2 question steps`);
    const sec = flowTotalDurationSec(s.steps);
    assert.ok(Math.abs(sec - s.minutes * 60) <= 30, `${id} duration ${sec}s vs ${s.minutes}min`);
    assert.equal(FORBIDDEN.test(blockForId(src, id)), false, `${id} hit forbidden token`);
  }
});

test('no new Mind tab or journal collection', () => {
  assert.equal(MIND_COLLECTIONS.length, 8);
  assert.equal(
    MIND_COLLECTIONS.some((c) => c.id === 'journal'),
    false
  );
  const page = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.doesNotMatch(page, /app\/\(app\)\/mind\//);
});

test('Mind merch is original MW and interpolates inventory counts', () => {
  const locales = readFileSync(join(root, 'src/i18n/mindLocales.ts'), 'utf8');
  const preview = readFileSync(join(root, 'src/components/mind/MindLockedPreview.tsx'), 'utf8');
  const bundle = readFileSync(join(root, 'src/i18n/bundleLocales.ts'), 'utf8');
  const bundlePage = readFileSync(join(root, 'src/page-components/BundlePage.tsx'), 'utf8');
  for (const [name, src] of [
    ['mindLocales', locales],
    ['MindLockedPreview', preview],
  ] as const) {
    assert.doesNotMatch(src, /Calm|Waking Up|Headspace|sleep stor/i, name);
  }
  assert.match(locales, /mindLockedHint:[\s\S]*\{\{free\}\}/);
  assert.match(locales, /mindLockedHint:[\s\S]*\{\{premium\}\}/);
  assert.doesNotMatch(locales, /Free tier includes 10/);
  assert.doesNotMatch(locales, /Premium adds 17/);
  assert.match(preview, /getContentInventory/);
  assert.match(preview, /free:\s*inv\.mind\.free/);
  assert.match(preview, /premium:\s*inv\.mind\.premium/);
  assert.match(bundle, /bundlePillarMindPremium:[\s\S]*\{\{count\}\}/);
  assert.doesNotMatch(bundle, /bundlePillarMindPremium: '22 /);
  assert.match(bundlePage, /CONTENT_FLOORS\.mindPremium/);
});
