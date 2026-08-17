import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, flowTotalDurationSec, getContentInventory } from '@/lib/contentInventory';
import { PREMIUM_MOVE_FLOW_COUNT } from '@/data/premiumInventory';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';

const root = join(import.meta.dirname, '..', '..', '..');

const S6_FREE_IDS = [
  'post-leg-day',
  'tspine-opener',
  'shoulder-cars',
  'wrist-elbow-care',
  'lateral-line',
  'post-run-cooldown',
  'recovery-wind-down',
] as const;

const D3_PREMIUM_IDS = [
  'post-pull-lat-flush-16',
  'post-press-chest-open-15',
  'knee-friendly-lower-14',
  'floor-only-hotel-16',
  'rotational-athlete-15',
  'post-carry-suitcase-14',
  'park-bench-recovery-16',
  'evening-hips-breath-18',
] as const;

function premiumSource(): string {
  return readFileSync(join(root, 'src/data/premiumMobilityFlows.ts'), 'utf8');
}

function loadPremiumFlows(): {
  id: string;
  name: string;
  durationMin: number;
  tags?: string[];
  steps: { title: string; cue: string; durationSec: number }[];
}[] {
  const src = premiumSource();
  const nameAt = src.indexOf('PREMIUM_MOBILITY_FLOWS');
  assert.ok(nameAt >= 0, 'PREMIUM_MOBILITY_FLOWS missing');
  // Skip the `MobilityFlow[]` type — its `[` is not the catalog.
  const eq = src.indexOf('=', nameAt);
  const start = src.indexOf('[', eq);
  assert.ok(start >= 0, 'premium catalog array missing');
  return Function(`"use strict"; return (${src.slice(start).replace(/;\s*$/, '')})`)();
}

test('D3 move premium floor is 56 and constants match file', () => {
  const flows = loadPremiumFlows();
  assert.equal(CONTENT_FLOORS.movePremium, 56);
  assert.equal(PREMIUM_MOVE_FLOW_COUNT, 56);
  assert.equal(flows.length, 56);
  assert.equal(getContentInventory().move.premium, 56);
});

test('D3 premium ids exist, unique, and do not collide with free', () => {
  const flows = loadPremiumFlows();
  const premIds = flows.map((f) => f.id);
  assert.equal(new Set(premIds).size, premIds.length);
  const freeIds = new Set(MOBILITY_FLOWS.map((f) => f.id));
  const overlap = premIds.filter((id) => freeIds.has(id));
  assert.deepEqual(overlap, [], `id collision with free catalog: ${overlap.join(', ')}`);
  assert.ok(!premIds.includes('morning-wake-up'), 'premium morning-wake-up still collides with free');
  assert.ok(premIds.includes('morning-wake-premium-11'));
  for (const id of D3_PREMIUM_IDS) {
    assert.ok(premIds.includes(id), id);
  }
});

test('every premium flow is tagged, long enough, and clock-honest', () => {
  const flows = loadPremiumFlows();
  for (const flow of flows) {
    assert.ok((flow.tags?.length ?? 0) >= 2, `${flow.id} needs ≥2 tags`);
    assert.ok(flow.steps.length >= 4, `${flow.id} too few steps`);
    const sec = flowTotalDurationSec(flow.steps);
    assert.ok(
      sec >= flow.durationMin * 60 - 60,
      `${flow.id} timer ${sec}s vs advertised ${flow.durationMin} min`
    );
  }
});

test('D3 original flows are long-form, prescribed, and clock-honest', () => {
  const flows = loadPremiumFlows();
  for (const id of D3_PREMIUM_IDS) {
    const flow = flows.find((f) => f.id === id);
    assert.ok(flow, id);
    assert.ok(flow!.steps.length >= 6, `${id} needs ≥6 steps`);
    assert.ok(flow!.durationMin >= 14 && flow!.durationMin <= 18, `${id} durationMin`);
  }
});

test('post-upper-flush is not tagged post-legs', () => {
  const flow = loadPremiumFlows().find((f) => f.id === 'post-upper-flush');
  assert.ok(flow, 'post-upper-flush missing');
  assert.ok(!flow!.tags?.includes('post-legs'), 'post-upper-flush still tagged post-legs');
});

test('S6 Victory free deep-link ids still exist with name prefixes', () => {
  const byId = new Map(MOBILITY_FLOWS.map((f) => [f.id, f]));
  const names: Record<(typeof S6_FREE_IDS)[number], string> = {
    'post-leg-day': 'Post-Leg-Day Recovery',
    'tspine-opener': 'T-Spine Opener',
    'shoulder-cars': 'Shoulder CARs Flow',
    'wrist-elbow-care': 'Wrist & Elbow Care',
    'lateral-line': 'Lateral Line',
    'post-run-cooldown': 'Post-Run Cooldown',
    'recovery-wind-down': 'Recovery Wind-Down',
  };
  for (const id of S6_FREE_IDS) {
    const row = byId.get(id);
    assert.ok(row, `S6 target ${id} missing from free catalog`);
    assert.ok(
      row!.name === names[id] || row!.name.startsWith(`${names[id]} (`),
      `${id} name ${row!.name} lost S6 prefix ${names[id]}`
    );
  }
});

test('locked Move preview interpolates floors and does not say a mobility app', () => {
  const preview = readFileSync(join(root, 'src/components/move/MoveLockedPreview.tsx'), 'utf8');
  const locales = readFileSync(join(root, 'src/i18n/moveLocales.ts'), 'utf8');
  assert.match(preview, /CONTENT_FLOORS\.moveFree/);
  assert.match(preview, /CONTENT_FLOORS\.movePremium/);
  assert.match(preview, /\{\{free\}\}/);
  assert.match(preview, /\{\{premium\}\}/);
  const en = locales.slice(locales.indexOf('const en:'), locales.indexOf('const es:'));
  const hint = en.slice(en.indexOf('moveLockedHint:'), en.indexOf('moveCollections:'));
  const literal = hint.replace(/\{\{[^}]+\}\}/g, '');
  assert.doesNotMatch(
    literal,
    /\d/,
    'moveLockedHint still hard-codes a count — interpolate CONTENT_FLOORS'
  );
  const defaultHint = preview.slice(preview.indexOf('moveLockedHint'), preview.indexOf('UnlockButton'));
  const defaultLiteral = defaultHint.replace(/\{\{[^}]+\}\}/g, '');
  assert.doesNotMatch(
    defaultLiteral,
    /\d/,
    'MoveLockedPreview defaultValue still hard-codes a count'
  );
  assert.doesNotMatch(preview, /a mobility app/);
  assert.doesNotMatch(en, /a mobility app/);
});

test('premium cues do not carry stripped-second leftovers', () => {
  const flows = loadPremiumFlows();
  for (const flow of flows) {
    for (const step of flow.steps) {
      assert.doesNotMatch(step.cue, /^[.\s]/, `${flow.id} ${step.title}: cue starts empty`);
      assert.doesNotMatch(step.cue, / \. /, `${flow.id} ${step.title}: leftover " . "`);
      assert.doesNotMatch(step.cue, /– if /, `${flow.id} ${step.title}: truncated range`);
      assert.doesNotMatch(step.cue, /\d+–(?!\d)/, `${flow.id} ${step.title}: truncated en-dash`);
    }
  }
});

test('premium equipment cues carry a floor fallback', () => {
  const flows = loadPremiumFlows();
  for (const flow of flows) {
    for (const step of flow.steps) {
      const blob = `${step.title} ${step.cue}`;
      if (/foam roll/i.test(blob)) {
        assert.match(
          blob,
          /no roller|If no roller|without a roller|else /i,
          `${flow.id} ${step.title} names a roller without a floor fallback`
        );
      }
      if (/\bband\b/i.test(blob) && !/band optional/i.test(blob)) {
        assert.match(
          blob,
          /no band|empty-hand|towel/i,
          `${flow.id} ${step.title} names a band without a floor fallback`
        );
      }
      if (/\b(dead hang|bar hang|\bbar\b)/i.test(blob) && !/broom/i.test(blob)) {
        assert.match(
          blob,
          /no bar|else /i,
          `${flow.id} ${step.title} names a bar without a floor fallback`
        );
      }
    }
  }
});

test('new D3 flows are train-anywhere (no required roller/band/bar without fallback)', () => {
  const flows = loadPremiumFlows();
  for (const id of D3_PREMIUM_IDS) {
    const flow = flows.find((f) => f.id === id);
    assert.ok(flow, id);
    const blob = flow!.steps.map((s) => `${s.title} ${s.cue}`).join(' ');
    if (/\bfoam roll/i.test(blob)) {
      assert.match(blob, /no roller|If no roller/i, id);
    }
    assert.ok(flow!.tags?.includes('no-equipment') || /floor|hotel|park|door/i.test(blob), id);
  }
});
