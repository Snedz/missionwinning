/**
 * Our export comes back. Empty / garbage invents nothing.
 * Confirm required. Cancel leaves the diary unchanged.
 * Round-trip: export → import → same live sessions.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideExportDiary } from './exportDiary.ts';
import { decideImportApply, decideImportDiary } from './importDiary.ts';

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

function ids() {
  let n = 0;
  return () => {
    n += 1;
    return { id: `imp-${n}`, clientId: `cid-imp-${n}` };
  };
}

const helperSrc = readFileSync(
  path.join(import.meta.dirname, 'importDiary.ts'),
  'utf8'
);

describe('decideImportDiary (.1013)', () => {
  it('empty / missing / garbage / wrong header invents nothing', () => {
    assert.deepEqual(decideImportDiary(null), { kind: 'empty' });
    assert.deepEqual(decideImportDiary(undefined), { kind: 'empty' });
    assert.deepEqual(decideImportDiary(''), { kind: 'empty' });
    assert.deepEqual(decideImportDiary('   '), { kind: 'empty' });
    assert.deepEqual(decideImportDiary('not a diary'), { kind: 'empty' });
    assert.deepEqual(decideImportDiary('{'), { kind: 'empty' });
    assert.deepEqual(decideImportDiary('[]'), { kind: 'empty' });
    assert.deepEqual(
      decideImportDiary('Date,Workout Name,Exercise\n2026-08-17,Push,Bench'),
      { kind: 'empty' }
    );
    assert.deepEqual(
      decideImportDiary(
        'date,sessionTitle,workoutName,lift,setType,kg,reps,rpe,tags,notes,duration\n'
      ),
      { kind: 'empty' }
    );
  });

  it('Hevy / Strong CSV on this door invents nothing', () => {
    assert.deepEqual(
      decideImportDiary(
        'title,start_time,end_time,exercise_title,set_index,weight_kg,reps\nPush,x,y,Bench,1,60,5'
      ),
      { kind: 'empty' }
    );
    assert.deepEqual(
      decideImportDiary(
        '"Date","Workout Name","Duration","Exercise Name","Set Order","Weight","Reps"\n'
      ),
      { kind: 'empty' }
    );
  });

  it('round-trip: export → import → same live sessions', () => {
    const monKey = localDateKeyFromIso('2026-08-17T11:00:00.000Z') ?? '';
    const live = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
      workoutName: 'Push',
      sessionNote: 'felt heavy',
      durationSeconds: 3600,
      exercises: [
        {
          exerciseId: 'bench-press',
          note: 'paused',
          sets: [
            {
              reps: 5,
              weight: 135,
              kind: 'warmup',
              rpe10: 7,
              side: 'L',
            },
          ],
        },
      ],
    });
    const exported = decideExportDiary([live]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;

    const csvParsed = decideImportDiary(exported.csv);
    const jsonParsed = decideImportDiary(exported.json);
    assert.equal(csvParsed.kind, 'ready');
    assert.equal(jsonParsed.kind, 'ready');
    if (csvParsed.kind !== 'ready' || jsonParsed.kind !== 'ready') return;
    assert.equal(csvParsed.count, 1);
    assert.equal(jsonParsed.count, 1);
    assert.equal(csvParsed.sessions[0]?.date, monKey);
    assert.equal(csvParsed.sessions[0]?.sessionTitle, 'Bogus Monday');
    assert.equal(csvParsed.sessions[0]?.workoutName, 'Push');
    assert.equal(csvParsed.sessions[0]?.sessionNote, 'felt heavy');
    assert.equal(csvParsed.sessions[0]?.durationSeconds, 3600);
    assert.equal(csvParsed.sessions[0]?.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(csvParsed.sessions[0]?.exercises[0]?.note, 'paused');
    assert.deepEqual(csvParsed.sessions[0]?.exercises[0]?.sets[0], {
      reps: 5,
      weight: 135,
      kind: 'warmup',
      rpe10: 7,
      side: 'L',
    });
    assert.deepEqual(jsonParsed.sessions, csvParsed.sessions);
    assert.equal(JSON.stringify(csvParsed.sessions).includes('e1RM'), false);
    assert.equal(JSON.stringify(csvParsed.sessions).includes('1RM'), false);
  });

  it('does not invent duration from start/end when the cell is blank', () => {
    const timedOff = log({
      id: 'log-off',
      durationSeconds: 0,
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:30:00.000Z',
    });
    const exported = decideExportDiary([timedOff]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    assert.equal(parsed.sessions[0]?.durationSeconds, 0);
  });

  it('set duration stays a set duration — session 0 stays 0', () => {
    const hold = log({
      id: 'log-hold',
      durationSeconds: 0,
      exercises: [
        {
          exerciseId: 'plank',
          sets: [{ reps: 0, weight: 0, durationSeconds: 45 }],
        },
      ],
    });
    const exported = decideExportDiary([hold]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    assert.equal(parsed.kind, 'ready');
    if (parsed.kind !== 'ready') return;
    assert.equal(parsed.sessions[0]?.durationSeconds, 0);
    assert.equal(parsed.sessions[0]?.exercises[0]?.sets[0]?.durationSeconds, 45);
  });

  it('rows without a lift or a real date invent nothing', () => {
    const header =
      'date,sessionTitle,workoutName,lift,setType,kg,reps,rpe,tags,notes,duration';
    assert.deepEqual(
      decideImportDiary(`${header}\n2026-08-17,Title,Push,,warmup,135,5,,,,\n`),
      { kind: 'empty' }
    );
    assert.deepEqual(
      decideImportDiary(`${header}\nnot-a-date,Title,Push,bench press,warmup,135,5,,,,\n`),
      { kind: 'empty' }
    );
  });
});

describe('decideImportApply (.1013)', () => {
  it('cancel / missing confirm leaves the diary unchanged', () => {
    const live = log({ id: 'log-mon', sessionTitle: 'Keep me' });
    const exported = decideExportDiary([live]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    const history = [live];
    assert.deepEqual(
      decideImportApply({ history, parsed, confirm: null, ids: ids() }),
      { kind: 'empty' }
    );
    assert.deepEqual(
      decideImportApply({ history, parsed, confirm: 'cancel', ids: ids() }),
      { kind: 'empty' }
    );
    assert.deepEqual(
      decideImportApply({ history, parsed, confirm: undefined, ids: ids() }),
      { kind: 'empty' }
    );
    assert.equal(history[0]?.sessionTitle, 'Keep me');
    assert.equal(history.length, 1);
  });

  it('empty parse never writes even with merge confirm', () => {
    const live = log({ id: 'log-mon' });
    const applied = decideImportApply({
      history: [live],
      parsed: { kind: 'empty' },
      confirm: 'merge',
      ids: ids(),
    });
    assert.deepEqual(applied, { kind: 'empty' });
  });

  it('merge upserts — same file does not duplicate', () => {
    const live = log({
      id: 'log-mon',
      sessionTitle: 'Bogus Monday',
    });
    const exported = decideExportDiary([live]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    const first = decideImportApply({
      history: [live],
      parsed,
      confirm: 'merge',
      ids: ids(),
    });
    assert.equal(first.kind, 'apply');
    if (first.kind !== 'apply') return;
    assert.equal(first.mode, 'merge');
    assert.equal(first.next.length, 1);
    assert.equal(first.next[0]?.id, 'log-mon');

    const second = decideImportApply({
      history: first.next,
      parsed,
      confirm: 'merge',
      ids: ids(),
    });
    assert.equal(second.kind, 'apply');
    if (second.kind !== 'apply') return;
    assert.equal(second.next.filter((row) => !row.deletedAt).length, 1);
    assert.equal(second.next[0]?.id, 'log-mon');
  });

  it('merge adds a session the diary does not have', () => {
    const existing = log({
      id: 'log-keep',
      sessionTitle: 'Already here',
      startedAt: '2026-08-18T10:00:00.000Z',
      completedAt: '2026-08-18T11:00:00.000Z',
    });
    const incoming = log({
      id: 'log-file',
      sessionTitle: 'From the file',
    });
    const exported = decideExportDiary([incoming]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    const applied = decideImportApply({
      history: [existing],
      parsed,
      confirm: 'merge',
      ids: ids(),
    });
    assert.equal(applied.kind, 'apply');
    if (applied.kind !== 'apply') return;
    const live = applied.next.filter((row) => !row.deletedAt);
    assert.equal(live.length, 2);
    assert.ok(live.some((row) => row.sessionTitle === 'Already here'));
    assert.ok(live.some((row) => row.sessionTitle === 'From the file'));
  });

  it('tomb stays a tomb unless the file has that live row', () => {
    const tomb = log({
      id: 'log-gone',
      sessionTitle: 'Deleted Monday',
      deletedAt: '2026-08-25T12:00:00.000Z',
    });
    const other = log({
      id: 'log-live',
      sessionTitle: 'Still here',
      startedAt: '2026-08-18T10:00:00.000Z',
      completedAt: '2026-08-18T11:00:00.000Z',
    });
    const otherFile = decideExportDiary([other]);
    assert.equal(otherFile.kind, 'ready');
    if (otherFile.kind !== 'ready') return;
    const parsedOther = decideImportDiary(otherFile.csv);
    const stay = decideImportApply({
      history: [tomb, other],
      parsed: parsedOther,
      confirm: 'merge',
      ids: ids(),
    });
    assert.equal(stay.kind, 'apply');
    if (stay.kind !== 'apply') return;
    const stillTomb = stay.next.find((row) => row.id === 'log-gone');
    assert.ok(stillTomb?.deletedAt);

    const restoredFile = decideExportDiary([
      log({
        id: 'log-gone',
        sessionTitle: 'Deleted Monday',
        deletedAt: null,
      }),
    ]);
    assert.equal(restoredFile.kind, 'ready');
    if (restoredFile.kind !== 'ready') return;
    const parsedRestored = decideImportDiary(restoredFile.csv);
    const back = decideImportApply({
      history: [tomb],
      parsed: parsedRestored,
      confirm: 'merge',
      ids: ids(),
    });
    assert.equal(back.kind, 'apply');
    if (back.kind !== 'apply') return;
    const live = back.next.find((row) => row.id === 'log-gone');
    assert.equal(live?.deletedAt ?? null, null);
    assert.equal(live?.sessionTitle, 'Deleted Monday');
  });

  it('replace is a second named confirm — never the default write', () => {
    const live = log({ id: 'log-mon', sessionTitle: 'Keep unless named' });
    const incoming = log({
      id: 'log-file',
      sessionTitle: 'From the file',
      startedAt: '2026-08-18T10:00:00.000Z',
      completedAt: '2026-08-18T11:00:00.000Z',
    });
    const exported = decideExportDiary([incoming]);
    assert.equal(exported.kind, 'ready');
    if (exported.kind !== 'ready') return;
    const parsed = decideImportDiary(exported.csv);
    const ask = decideImportApply({
      history: [live],
      parsed,
      confirm: 'replace',
      ids: ids(),
    });
    assert.equal(ask.kind, 'needs-replace-confirm');
    if (ask.kind !== 'needs-replace-confirm') return;
    assert.equal(ask.incoming, 1);
    assert.equal(ask.live, 1);

    const applied = decideImportApply({
      history: [live],
      parsed,
      confirm: 'replace-confirmed',
      ids: ids(),
      now: '2026-08-26T12:00:00.000Z',
    });
    assert.equal(applied.kind, 'apply');
    if (applied.kind !== 'apply') return;
    assert.equal(applied.mode, 'replace');
    const stillLive = applied.next.filter((row) => !row.deletedAt);
    assert.equal(stillLive.length, 1);
    assert.equal(stillLive[0]?.sessionTitle, 'From the file');
    const tomb = applied.next.find((row) => row.id === 'log-mon');
    assert.ok(tomb?.deletedAt);
  });

  it('does not import Account interchange or fold / search / store', () => {
    assert.doesNotMatch(helperSrc, /importCsv|importCsvRestore|buildWorkoutCsvDownload|workoutsToMwCsv/);
    assert.doesNotMatch(helperSrc, /foldHistoryFrom|historyForWeek|startHistoryFrom/);
    assert.doesNotMatch(helperSrc, /decideSearchHistory/);
    assert.doesNotMatch(helperSrc, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helperSrc, /e1RM|estimated 1RM|toISOString\(\)/);
  });
});
