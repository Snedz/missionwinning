import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  AMRAP_DEFAULT_SECONDS,
  AMRAP_PRESETS,
  EMOM_INTERVAL_SECONDS,
  formatWorkClock,
  resolveWorkClockStart,
  shouldAutoRestAfterLog,
  tickWorkClock,
} from '@/lib/workout/workClock';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED_IMPORT =
  /from\s+['"]@\/lib\/(?:premium|rewards|identity|social|wearables|speech|sync\/)/;

describe('resolveWorkClockStart', () => {
  it('interval start is 60; extra seconds are ignored', () => {
    assert.deepEqual(resolveWorkClockStart({ kind: 'interval' }), {
      kind: 'interval',
      seconds: EMOM_INTERVAL_SECONDS,
    });
    assert.deepEqual(resolveWorkClockStart({ kind: 'interval', seconds: 120 }), {
      kind: 'interval',
      seconds: 60,
    });
  });

  it('countdown without seconds is 10:00; presets win; unknown finite falls back to 10:00', () => {
    assert.deepEqual(resolveWorkClockStart({ kind: 'countdown' }), {
      kind: 'countdown',
      seconds: AMRAP_DEFAULT_SECONDS,
    });
    assert.deepEqual(resolveWorkClockStart({ kind: 'countdown', seconds: 300 }), {
      kind: 'countdown',
      seconds: 300,
    });
    assert.deepEqual(resolveWorkClockStart({ kind: 'countdown', seconds: 90 }), {
      kind: 'countdown',
      seconds: AMRAP_DEFAULT_SECONDS,
    });
    assert.deepEqual(AMRAP_PRESETS, [300, 600, 720, 1200]);
  });

  it('unknown kind / NaN / 0 invents nothing', () => {
    assert.equal(resolveWorkClockStart({ kind: null }), null);
    assert.equal(resolveWorkClockStart({ kind: 'rest' }), null);
    assert.equal(resolveWorkClockStart({ kind: 'countdown', seconds: 0 }), null);
    assert.equal(resolveWorkClockStart({ kind: 'countdown', seconds: Number.NaN }), null);
    assert.equal(resolveWorkClockStart({ kind: undefined }), null);
  });
});

describe('tickWorkClock', () => {
  it('interval tick from 1 restarts 60 and stays active', () => {
    assert.deepEqual(tickWorkClock({ kind: 'interval', remaining: 2 }), {
      remaining: 1,
      active: true,
      restarted: false,
    });
    assert.deepEqual(tickWorkClock({ kind: 'interval', remaining: 1 }), {
      remaining: 60,
      active: true,
      restarted: true,
    });
  });

  it('countdown tick from 1 stops at 0', () => {
    assert.deepEqual(tickWorkClock({ kind: 'countdown', remaining: 2 }), {
      remaining: 1,
      active: true,
      restarted: false,
    });
    assert.deepEqual(tickWorkClock({ kind: 'countdown', remaining: 1 }), {
      remaining: 0,
      active: false,
      restarted: false,
    });
  });
});

describe('shouldAutoRestAfterLog', () => {
  it('work clock on skips auto rest; off keeps ordinary rest', () => {
    assert.equal(shouldAutoRestAfterLog({ workClockActive: true }), false);
    assert.equal(shouldAutoRestAfterLog({ workClockActive: false }), true);
  });
});

describe('formatWorkClock', () => {
  it('shares the rest clock string', () => {
    assert.equal(formatWorkClock(90), '1:30');
    assert.equal(formatWorkClock(9), '9s');
  });
});

describe('workClock wiring + refuse', () => {
  it('helper + row + store do not import premium / rewards / social / Health / speech / wearables', () => {
    const files = [
      'src/lib/workout/workClock.ts',
      'src/lib/workout/activeSessionFinish.ts',
      'src/components/workout/SetLogTable.tsx',
    ];
    for (const rel of files) {
      assert.doesNotMatch(read(rel), BANNED_IMPORT, `${rel} reached a refused domain`);
    }
    const store = read('src/store/workoutStore.ts');
    const clock = store.match(
      /startWorkClock:[\s\S]*?stopWorkClock:[\s\S]*?\n\s*\},/
    );
    assert.ok(clock, 'work clock actions missing');
    assert.doesNotMatch(clock![0], /premium|rewards|Health|wearable|speech/);
  });

  it('Today / /private / gated door do not import workClock or mount the chips', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'app/private/GateTeaser.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      if (!existsSync(path.join(root, rel))) continue;
      const src = read(rel);
      assert.doesNotMatch(src, /workClock/, `${rel} must not import the work clock`);
      assert.doesNotMatch(
        src,
        /set-row-work-clock/,
        `${rel} must not mount the set-row clock`
      );
    }
  });

  it('SetLogTable mounts idle chips and a running clock on the live row only', () => {
    const src = read('src/components/workout/SetLogTable.tsx');
    assert.match(src, /set-row-work-clock-start/);
    assert.match(src, /set-row-work-clock/);
    assert.match(src, /onStartWorkClock/);
    assert.match(src, /isActive/);
    assert.doesNotMatch(src, /RestTimerBar/);
  });

  it('planLogSetRest reads shouldAutoRestAfterLog', () => {
    const finish = read('src/lib/workout/activeSessionFinish.ts');
    assert.match(finish, /shouldAutoRestAfterLog/);
    assert.match(finish, /workClockActive/);
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /workClockActive/);
    assert.match(page, /planLogSetRest\(/);
  });

  it('page ticks the work clock locally — no await on the start path', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /tickWorkClock/);
    assert.match(page, /startWorkClock/);
    const start = page.match(/onStartWorkClock[\s\S]{0,200}/);
    assert.ok(start, 'start work clock wiring missing');
    assert.doesNotMatch(start![0], /\bawait\b/);
  });
});
