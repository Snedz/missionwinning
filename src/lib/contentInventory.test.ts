import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT_FLOORS,
  flowTotalDurationSec,
  getContentInventory,
  premiumInventoryIsConsistent,
} from '@/lib/contentInventory';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';

const root = join(import.meta.dirname, '..', '..');

function countIdsInFile(rel: string): number {
  const t = readFileSync(join(root, rel), 'utf8');
  return [...t.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].length;
}

describe('contentInventory', () => {
  it('meets current Super Bundle depth floors', () => {
    const inv = getContentInventory();
    assert.ok(inv.move.free >= CONTENT_FLOORS.moveFree, `move free ${inv.move.free}`);
    assert.ok(inv.move.premium >= CONTENT_FLOORS.movePremium, `move prem ${inv.move.premium}`);
    assert.ok(inv.mind.free >= CONTENT_FLOORS.mindFree, `mind free ${inv.mind.free}`);
    assert.ok(inv.mind.premium >= CONTENT_FLOORS.mindPremium, `mind prem ${inv.mind.premium}`);
    assert.ok(inv.recipes.free >= CONTENT_FLOORS.recipesFree);
    assert.ok(inv.recipes.premium >= CONTENT_FLOORS.recipesPremium);
    assert.ok(inv.learn.premiumSections >= CONTENT_FLOORS.learnPremiumSections);
  });

  it('free arrays match inventory free counts', () => {
    const inv = getContentInventory();
    assert.equal(inv.move.free, MOBILITY_FLOWS.length);
    assert.equal(inv.mind.free, GUIDED_MIND_SESSIONS.length);
    assert.equal(inv.recipes.free, FREE_RECIPES.length);
  });

  it('premium constants match server catalog id counts', () => {
    const inv = getContentInventory();
    assert.equal(inv.move.premium, countIdsInFile('src/data/premiumMobilityFlows.ts'));
    assert.equal(inv.mind.premium, countIdsInFile('src/data/premiumMindSessions.ts'));
  });

  it('PREMIUM_INVENTORY object is internally consistent', () => {
    assert.equal(premiumInventoryIsConsistent(), true);
  });

  it('every free mobility flow has meaningful duration', () => {
    for (const flow of MOBILITY_FLOWS) {
      const sec = flowTotalDurationSec(flow.steps);
      assert.ok(sec >= 180, `${flow.id} only ${sec}s`);
      assert.ok(flow.steps.length >= 4, `${flow.id} too few steps`);
    }
  });

  it('every free mind session has steps and minutes', () => {
    for (const s of GUIDED_MIND_SESSIONS) {
      assert.ok(s.steps.length >= 2, s.id);
      assert.ok(s.minutes >= 1, s.id);
      const sec = flowTotalDurationSec(s.steps);
      assert.ok(sec >= 60, `${s.id} only ${sec}s`);
    }
  });

  it('unlocked totals are free+premium', () => {
    const inv = getContentInventory();
    assert.equal(inv.unlockedTotal.move, inv.move.free + inv.move.premium);
    assert.equal(inv.unlockedTotal.mind, inv.mind.free + inv.mind.premium);
  });
});
