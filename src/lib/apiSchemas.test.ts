/**
 * The validation layer for all 67 API routes, actually handed some input.
 *
 * `apiSchemas.ts` measured **98.23% lines / 23.91% functions** — and the line
 * number is the honest-looking one. It is Zod: `z.object({…})` executes at module
 * load, so anything that imports the file "covers" nearly every line of it, while
 * the refinements, the bounds and the parse paths never run. Thirty-five schemas
 * are exported; **three** were named anywhere in this suite
 * (`leadsBodySchema`, `pushSubscribeBodySchema`, `inviteCreateBodySchema`).
 *
 * This is the vacuous-guard shape the repo keeps paying for (`.204`, `.207`,
 * `.213`, `.220`), reached from the other direction. Nothing here was *asserted*
 * wrongly; a coverage metric was simply answering a different question than the
 * one it appeared to answer, and the answer looked good.
 *
 * ## What is pinned, and why each rule exists
 *
 * 1. **Every schema has fixtures** — discovered from the module, not enumerated
 *    here. `.220`'s rule: a guard whose *name* claims a scope wider than its
 *    *list* has only ever tested the list. Schema 36 fails this file until it is
 *    given a valid and an invalid case.
 * 2. **The first valid fixture supplies every declared key, and every key
 *    survives** — this is `.184`, written down. `mobileSyncSetSchema.note` was
 *    dropped *by omission*: Android sent it, zod stripped it silently, and every
 *    set note died at this boundary. A stripping validator fails open — the
 *    request succeeds, the data is gone, and no error is raised anywhere.
 * 3. **Bounds are exercised in the rejecting direction** — a `max()` nobody has
 *    ever exceeded in a test is indistinguishable from a `max()` that was deleted.
 *    The invalid fixtures target the bound that matters per schema, not a generic
 *    type error: `childAge: 18` (the COPPA line), `dayReviewHour: 23` (`.194`),
 *    `rpe: 5`, an invite code containing the `1`/`I` the alphabet excludes.
 * 4. **Defaults still default** — a removed `.default()` is a silent behaviour
 *    change with no failing parse to announce it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import * as schemas from './apiSchemas.ts';
import { parseJsonBody, parseQuery } from './apiSchemas.ts';

type Case = {
  /** First entry must supply **every** key the schema declares — rule 2. */
  valid: unknown[];
  invalid: { input: unknown; because: string }[];
};

const UUID = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';
const UUID_2 = '7c1e4b90-2a3d-4f56-8b9c-0d1e2f3a4b5c';
const SIG = 'z'.repeat(88);

const CASES: Record<string, Case> = {
  accountDeleteBodySchema: {
    valid: [{ confirm: 'DELETE', deviceId: 'device-1' }],
    invalid: [
      {
        input: { confirm: 'delete' },
        because:
          'the literal is the second confirmation — a console-typed fetch without the exact casing must delete nothing',
      },
      { input: {}, because: 'confirm is required' },
      {
        input: { confirm: 'DELETE', deviceId: 'x'.repeat(65) },
        because: 'device ids are client UUIDs; 64 bounds junk',
      },
    ],
  },

  checkoutBodySchema: {
    valid: [{ planId: 'lifetime' }, { planId: 'monthly' }, { planId: '12mo' }],
    invalid: [
      { input: { planId: 'weekly' }, because: 'there is one subscription and three plans; a fourth is a typo' },
      { input: {}, because: 'planId is required' },
    ],
  },

  coachChatSchema: {
    valid: [
      {
        message: 'How should I approach squats this week?',
        turns: [{ role: 'user', content: 'hi' }],
        context: {
          readiness: 60,
          strain: 40,
          recovery: 70,
          trainDays14: 5,
          todaySession: {
            name: 'Push',
            kind: 'strength',
            estMinutes: 45,
            exercises: [{ id: 'bench', name: 'Bench press' }],
          },
          exerciseId: 'bench',
        },
        stream: false,
        deviceId: 'device-1',
      },
    ],
    invalid: [
      {
        input: { message: '', context: { readiness: 60, strain: 40, recovery: 70, trainDays14: 5 } },
        because: 'an empty message would spend an LLM call on nothing',
      },
      {
        input: {
          message: 'hi',
          turns: Array.from({ length: 13 }, () => ({ role: 'user', content: 'x' })),
          context: { readiness: 60, strain: 40, recovery: 70, trainDays14: 5 },
        },
        because: 'the 12-turn cap is what bounds the prompt this route pays for',
      },
    ],
  },

  coachDailyContextSchema: {
    valid: [
      {
        readiness: 60,
        strain: 40,
        recovery: 70,
        missionScore: 55,
        streak: 3,
        focusGroup: 'pull',
        pillars: { moveFlows: 1, mindSessions: 2, proteinDays: 3, trainDays: 4 },
        fallback: { messageKey: 'coachInsightSteady', actionLabelKey: 'coachActionTrain', actionPath: '/active' },
        deviceId: 'device-1',
      },
    ],
    invalid: [
      {
        input: {
          readiness: 101,
          strain: 40,
          recovery: 70,
          fallback: { messageKey: 'a', actionLabelKey: 'b', actionPath: '/c' },
        },
        because: 'readiness is a 0–100 score; 101 means the caller is sending something else',
      },
      { input: { readiness: 60, strain: 40, recovery: 70 }, because: 'fallback is required — it is what the route degrades to' },
    ],
  },

  coachPlanVoiceSchema: {
    valid: [
      {
        plan: { weekStart: '2026-07-27', sessions: [{ name: 'Push', kind: 'strength', whyKeys: ['whyPush'] }] },
        readiness: 55,
        strain: 40,
        recovery: 60,
        deviceId: 'device-1',
      },
    ],
    invalid: [
      { input: { readiness: 55 }, because: 'there is nothing to narrate without a plan' },
      {
        input: { plan: { weekStart: '2026-07-27', sessions: [{ name: 'Push' }] } },
        because: 'a session without a kind cannot be described',
      },
    ],
  },

  cryptoCheckoutConfirmSchema: {
    valid: [{ intentId: UUID, signature: SIG }],
    invalid: [
      { input: { intentId: 'not-a-uuid', signature: SIG }, because: 'the intent id is the row this confirms — a loose string lets it be guessed at' },
      { input: { intentId: UUID, signature: 'short' }, because: 'a 5-character Solana signature does not exist' },
    ],
  },

  fuelBarcodeQuerySchema: {
    valid: [{ code: '0123456789012' }],
    invalid: [{ input: { code: '123' }, because: 'no barcode is 3 digits; this is a fat-fingered query hitting a third-party API' }],
  },

  fuelSearchQuerySchema: {
    valid: [{ q: 'chicken breast' }],
    invalid: [{ input: { q: 'a' }, because: 'a single character searches the whole food database for nothing' }],
  },

  inviteCodeBodySchema: {
    valid: [{ code: 'MW-B-ABCDE' }],
    invalid: [
      { input: { code: 'MW-B-ABCD1' }, because: '1 is excluded from the alphabet precisely so it cannot be confused with I' },
      { input: { code: 'MW-ABCDE' }, because: 'that is a referral code — the two formats must not be interchangeable' },
    ],
  },

  inviteCreateBodySchema: {
    valid: [{ label: 'Gym friend', email: 'tester@example.com', notes: 'met at the gym' }, { label: 'No email' }],
    invalid: [
      { input: { label: '   ' }, because: 'trim() then min(1) — whitespace is not a label' },
      { input: { label: 'ok', email: 'nope' }, because: 'the refine is the only thing checking this address' },
    ],
  },

  journeyNudgeBodySchema: {
    valid: [{ label: 'Log a set', description: 'Two minutes', href: '/active', stepLabel: 'Basic' }],
    invalid: [{ input: { label: 'x'.repeat(121) }, because: 'every field here is optional, so the length cap is the only validation there is' }],
  },

  leadsBodySchema: {
    valid: [
      {
        email: 'tester@example.com',
        name: 'Tester',
        goals: 'Get stronger',
        source: 'feedback-page',
        package_interest: 'bundle',
        referrer: 'https://example.com',
        utm: {
          utm_source: 'x',
          utm_medium: 'social',
          utm_campaign: 'launch',
          utm_content: 'a',
          utm_term: 'b',
          landing_path: '/',
        },
      },
      // `.215` — a feedback note must not require an account.
      { goals: 'The timer jumped', source: 'feedback-page' },
    ],
    invalid: [
      { input: { email: 'not-an-email' }, because: 'the waitlist requires a deliverable address' },
      { input: { goals: 'x'.repeat(2001) }, because: 'the goals column caps at 2000 and the route re-slices silently (.215)' },
    ],
  },

  mobileCoachAdaptBodySchema: {
    valid: [
      {
        plan: {
          revision: 2,
          weekStart: '2026-07-27',
          daysPerWeek: 4,
          sessions: [{ id: 's1' }],
          generatedAt: '2026-07-27T00:00:00.000Z',
          contextHash: 'hash',
          equipmentProfile: 'dumbbells',
        },
        sessionId: 's1',
      },
    ],
    invalid: [
      {
        input: {
          plan: {
            revision: 1,
            weekStart: '2026-07-27',
            daysPerWeek: 8,
            sessions: [],
            generatedAt: 'x',
            contextHash: 'h',
            equipmentProfile: 'full-gym',
          },
          sessionId: 's1',
        },
        because: 'a week has seven days',
      },
    ],
  },

  mobileCoachPlanBodySchema: {
    valid: [{ equipment: 'full-gym', withAdaptDemo: true, revision: 3 }],
    invalid: [{ input: { equipment: 'barbell' }, because: 'the three profiles are what seedPlan branches on' }],
  },

  mobileSyncCustomPushBodySchema: {
    valid: [{ exercises: [{ clientId: 'c1', name: 'Zercher squat' }] }],
    invalid: [{ input: { exercises: [] }, because: 'an empty push is a wasted round trip on gym wifi' }],
  },

  mobileSyncCustomSchema: {
    valid: [
      {
        clientId: 'c1',
        name: 'Zercher squat',
        createdAt: '2026-07-27T00:00:00.000Z',
        equipment: 'barbell',
        muscleGroups: 'quads,core',
        revision: 2,
        updatedAt: '2026-07-27T01:00:00.000Z',
        deletedAt: null,
      },
    ],
    invalid: [{ input: { clientId: '', name: 'x' }, because: 'the client id is what dedupes this row across devices' }],
  },

  mobileSyncPrefsPushBodySchema: {
    valid: [{ prefs: { weightUnit: 'lb', defaultRestSeconds: 90, equipment: 'dumbbells', barWeightKg: 20, barWeightLb: 45, revision: 2, updatedAt: '2026-07-27T00:00:00.000Z' } }],
    invalid: [{ input: {}, because: 'prefs is the whole payload' }],
  },

  mobileSyncPrefsSchema: {
    valid: [
      {
        weightUnit: 'lb',
        defaultRestSeconds: 90,
        equipment: 'full-gym',
        barWeightKg: 25,
        barWeightLb: 55,
        revision: 4,
        updatedAt: '2026-07-27T00:00:00.000Z',
      },
    ],
    invalid: [{ input: { defaultRestSeconds: 5 }, because: 'a 5-second rest timer is a mis-scaled unit, not a preference' }],
  },

  mobileSyncPushBodySchema: {
    valid: [
      {
        workouts: [
          { clientId: UUID, workoutName: 'Push day', completedAt: '2026-07-27T00:00:00.000Z', durationSeconds: 3600, setCount: 12, totalVolume: 5000 },
        ],
      },
    ],
    invalid: [{ input: { workouts: [] }, because: 'min(1) — an empty sync is not a sync' }],
  },

  mobileSyncRoutineExerciseSchema: {
    valid: [{ exerciseId: 'bench', exerciseName: 'Bench press', sets: 3, targetReps: 8, lastWeight: 60 }],
    invalid: [{ input: { exerciseId: 'bench', sets: 0, targetReps: 8 }, because: 'zero sets is not a routine entry' }],
  },

  mobileSyncRoutinePushBodySchema: {
    valid: [{ routines: [{ clientId: UUID, name: 'Upper A' }] }],
    invalid: [{ input: { routines: [] }, because: 'min(1)' }],
  },

  mobileSyncRoutineSchema: {
    valid: [
      {
        clientId: UUID,
        name: 'Upper A',
        createdAt: '2026-07-27T00:00:00.000Z',
        sourceWorkoutId: 'w1',
        exercises: [{ exerciseId: 'bench', exerciseName: 'Bench press', sets: 3, targetReps: 8, lastWeight: 60 }],
        revision: 2,
        updatedAt: '2026-07-27T01:00:00.000Z',
        deletedAt: null,
      },
    ],
    invalid: [{ input: { clientId: 'not-a-uuid', name: 'Upper A' }, because: 'the uuid is the cross-device identity of this routine' }],
  },

  mobileSyncSetSchema: {
    valid: [
      {
        id: 'set-1',
        exerciseId: 'bench',
        exerciseName: 'Bench press',
        setIndex: 0,
        reps: 8,
        weight: 60,
        completedAt: '2026-07-27T00:00:00.000Z',
        sessionId: 'sess-1',
        weightUnit: 'kg',
        rpe: 8,
        rir: 2,
        setKind: 'normal',
        // `.184` — this field is the reason rule 2 exists.
        note: 'felt heavy off the chest',
      },
    ],
    invalid: [
      { input: { id: 's', exerciseId: 'e', setIndex: 0, reps: 5, weight: 10, completedAt: 'x', rpe: 5 }, because: 'RPE is a 6–10 scale; 5 means the client is sending a different scale' },
      { input: { id: 's', exerciseId: 'e', setIndex: 0, reps: 5, weight: 10, completedAt: 'x', rir: 6 }, because: 'RIR is 0–5; 6 is a different scale' },
      { input: { id: 's', exerciseId: 'e', setIndex: 0, reps: -1, weight: 10, completedAt: 'x' }, because: 'negative reps' },
    ],
  },

  mobileSyncWorkoutSchema: {
    valid: [
      {
        clientId: UUID_2,
        workoutName: 'Push day',
        completedAt: '2026-07-27T00:00:00.000Z',
        durationSeconds: 3600,
        setCount: 12,
        totalVolume: 5000,
        sessionId: 'sess-1',
        weightUnit: 'kg',
        revision: 2,
        updatedAt: '2026-07-27T01:00:00.000Z',
        deletedAt: null,
        sets: [
          { id: 'set-1', exerciseId: 'bench', setIndex: 0, reps: 8, weight: 60, completedAt: '2026-07-27T00:00:00.000Z' },
        ],
      },
    ],
    invalid: [
      { input: { clientId: UUID_2, workoutName: 'Push', completedAt: 'x', durationSeconds: 0, setCount: 1, totalVolume: 1 }, because: 'a zero-second workout is a bug upstream, and it would land in history as real' },
    ],
  },

  mobileWorkoutLogBodySchema: {
    valid: [
      {
        workoutName: 'Push day',
        durationSeconds: 3600,
        setCount: 12,
        totalVolume: 5000,
        sessionId: 'sess-1',
        completedAt: '2026-07-27T00:00:00.000Z',
      },
    ],
    invalid: [{ input: { workoutName: 'Push', durationSeconds: 86_401, setCount: 1, totalVolume: 1 }, because: 'over 24h — a stuck timer, not a session' }],
  },

  privateAccessBodySchema: {
    valid: [{ password: 'let-me-in' }],
    invalid: [{ input: { password: '' }, because: 'an empty password must never reach the comparison' }],
  },

  pushSubscribeBodySchema: {
    valid: [
      {
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
        p256dh: 'key',
        auth: 'auth',
        deviceId: 'device-1',
        lastSessionAt: '2026-07-27T00:00:00.000Z',
        daysPerWeek: 4,
        timeZone: 'Europe/London',
        dayReviewHour: 20,
        lastSessionHigh: true,
      },
      // null is "turn the evening review off" and must reach the column.
      { endpoint: 'https://example.com/p', p256dh: 'k', auth: 'a', deviceId: 'd', dayReviewHour: null },
    ],
    invalid: [
      { input: { endpoint: 'https://example.com/p', p256dh: 'k', auth: 'a', deviceId: 'd', dayReviewHour: 23 }, because: 'the evening review window is 18–22 (.194)' },
      { input: { endpoint: 'not-a-url', p256dh: 'k', auth: 'a', deviceId: 'd' }, because: 'the endpoint is fetched by the server' },
    ],
  },

  pushUnsubscribeBodySchema: {
    valid: [{ endpoint: 'https://fcm.googleapis.com/fcm/send/abc' }],
    invalid: [{ input: { endpoint: 'not-a-url' }, because: 'the endpoint is the row key' }],
  },

  referralRedeemBodySchema: {
    valid: [{ code: 'MW-ABCDE' }],
    invalid: [
      { input: { code: 'MW-B-ABCDE' }, because: 'that is an invite code — redeeming it here would credit the wrong funnel (.218)' },
      { input: { code: 'MW-ABC0E' }, because: '0 is excluded so it cannot be read as O' },
    ],
  },

  schoolClassCreateSchema: {
    valid: [{ code: 'CLASS-01', name: 'Period 3', teacherPin: '4821' }],
    invalid: [{ input: { code: 'ab' }, because: 'a 2-character class code is trivially enumerable' }],
  },

  schoolPinBodySchema: {
    valid: [{ pin: '4821' }],
    invalid: [{ input: { pin: '12' }, because: 'the PIN gates a roster of student names (.211)' }],
  },

  wearableDisconnectSchema: {
    valid: [{ provider: 'whoop', deleteSamples: false }],
    invalid: [{ input: { provider: 'a' }, because: 'no provider slug is one character' }],
  },

  wearableHubIngestSchema: {
    valid: [
      {
        source: 'health_connect',
        samples: [
          {
            kind: 'sleep',
            startedAt: '2026-07-27T00:00:00.000Z',
            endedAt: '2026-07-27T07:00:00.000Z',
            externalId: 'ext-1',
            metrics: { minutes: 420, quality: 'good', napped: false, hrv: null },
          },
        ],
      },
    ],
    invalid: [
      { input: { source: 'fitbit', samples: [] }, because: 'the three hubs are what mapSamples branches on' },
      {
        input: { source: 'healthkit', samples: [{ kind: 'mood', startedAt: '2026-07-27', externalId: 'e' }] },
        because: 'an unknown sample kind would be stored and never read',
      },
    ],
  },

  wearableSyncSchema: {
    valid: [{ provider: 'whoop', sinceIso: '2026-07-27T00:00:00.000Z' }],
    invalid: [{ input: { provider: '' }, because: 'an empty provider would sync nothing, successfully' }],
  },

  youthConsentNotifySchema: {
    valid: [{ parentEmail: 'parent@example.com', childAge: 12 }],
    invalid: [
      { input: { parentEmail: 'parent@example.com', childAge: 18 }, because: 'this flow exists for under-18s; 18 means the caller bypassed the age check' },
      { input: { parentEmail: 'nope', childAge: 12 }, because: 'the consent email must be deliverable' },
    ],
  },

  youthConsentVerifySchema: {
    valid: [{ parentEmail: 'parent@example.com', childAge: 12, code: '123456' }],
    invalid: [
      { input: { parentEmail: 'parent@example.com', childAge: 12, code: '123' }, because: 'a 3-character consent code is brute-forceable' },
      { input: { parentEmail: 'parent@example.com', childAge: 0, code: '123456' }, because: 'age 0' },
    ],
  },
};

/**
 * Defaults, stated. A removed `.default()` changes what lands in the column
 * without failing a single parse, so nothing else in this file would notice.
 */
const DEFAULTS: { schema: string; input: unknown; expect: Record<string, unknown> }[] = [
  {
    schema: 'wearableDisconnectSchema',
    input: { provider: 'whoop' },
    // Deleting the samples is the privacy-safe default; flipping it to false
    // would leave a disconnected provider's history on the server.
    expect: { deleteSamples: true },
  },
  {
    schema: 'mobileSyncPrefsSchema',
    input: {},
    expect: { weightUnit: 'kg', defaultRestSeconds: 60, equipment: 'bodyweight', barWeightKg: 20, barWeightLb: 45, revision: 1 },
  },
  {
    schema: 'mobileSyncSetSchema',
    input: { id: 's', exerciseId: 'e', setIndex: 0, reps: 5, weight: 10, completedAt: '2026-07-27' },
    expect: { exerciseName: '', weightUnit: 'kg', setKind: 'normal' },
  },
  {
    schema: 'mobileCoachPlanBodySchema',
    input: {},
    expect: { equipment: 'bodyweight', withAdaptDemo: false },
  },
  {
    schema: 'coachChatSchema',
    input: { message: 'hi', context: { readiness: 60, strain: 40, recovery: 70, trainDays14: 5 } },
    expect: { turns: [] },
  },
  {
    schema: 'coachDailyContextSchema',
    input: { readiness: 60, strain: 40, recovery: 70, fallback: { messageKey: 'a', actionLabelKey: 'b', actionPath: '/c' } },
    expect: { missionScore: 0, streak: 0, focusGroup: 'push', pillars: { moveFlows: 0, mindSessions: 0, proteinDays: 0, trainDays: 0 } },
  },
  {
    schema: 'mobileSyncWorkoutSchema',
    input: { clientId: UUID, workoutName: 'Push', completedAt: '2026-07-27', durationSeconds: 60, setCount: 1, totalVolume: 1 },
    expect: { weightUnit: 'kg', revision: 1, sets: [] },
  },
];

/** Every exported Zod schema, discovered — never a hand-kept list (`.220`). */
function exportedSchemas(): [string, z.ZodType][] {
  // Not a type predicate: the module namespace also exports `parseJsonBody` and
  // `parseQuery`, so the entries union is not assignable to the narrowed tuple.
  return Object.entries(schemas).filter(([, v]) => v instanceof z.ZodType) as [string, z.ZodType][];
}

/**
 * Rule 1 — the list cannot go stale, because it is not a list.
 *
 * A new schema is a new API input, and it arrives with no fixtures at all. This
 * is the assertion that makes every other rule below apply to schema 36.
 */
test('every exported schema has fixtures', () => {
  const undocumented = exportedSchemas()
    .map(([name]) => name)
    .filter((name) => !CASES[name]);
  assert.deepEqual(
    undocumented,
    [],
    `these schemas validate a live API route and have no fixtures:\n  ${undocumented.join('\n  ')}\n` +
      '  Add a valid case (supplying every declared key) and at least one invalid case ' +
      'targeting the bound that actually matters for that route.'
  );

  const stale = Object.keys(CASES).filter((name) => !(name in schemas));
  assert.deepEqual(stale, [], `fixtures for schemas that no longer exist:\n  ${stale.join('\n  ')}`);

  for (const [name, c] of Object.entries(CASES)) {
    assert.ok(c.valid.length >= 1, `${name}: needs at least one valid fixture`);
    assert.ok(c.invalid.length >= 1, `${name}: needs at least one invalid fixture — a schema only ever asked to accept is a schema whose bounds are untested`);
  }
});

test('every valid fixture parses', () => {
  for (const [name, c] of Object.entries(CASES)) {
    const schema = schemas[name as keyof typeof schemas] as z.ZodType;
    c.valid.forEach((input, i) => {
      const r = schema.safeParse(input);
      assert.ok(
        r.success,
        `${name} valid[${i}] was rejected: ${r.success ? '' : r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`
      );
    });
  }
});

test('every invalid fixture is rejected, with a usable message', () => {
  for (const [name, c] of Object.entries(CASES)) {
    const schema = schemas[name as keyof typeof schemas] as z.ZodType;
    for (const { input, because } of c.invalid) {
      const r = schema.safeParse(input);
      assert.ok(!r.success, `${name} accepted an input it must reject — ${because}`);

      // The route surfaces exactly this string, so an empty one is a 400 that
      // tells the client nothing.
      const viaRoute = parseJsonBody(schema, input);
      assert.equal(viaRoute.ok, false);
      assert.ok(
        !viaRoute.ok && viaRoute.error.length > 0,
        `${name}: parseJsonBody returned an empty error — ${because}`
      );
    }
  }
});

/**
 * Rule 2 — `.184`, executable.
 *
 * `mobileSyncSetSchema.note` was missing from the schema while Android sent it on
 * every set. Zod strips unknown keys silently, so the request succeeded, the
 * response was 200, and the athlete's note was gone. Nothing failed; nothing
 * logged. A stripping validator fails *open*, which is why the round trip has to
 * be asserted rather than the rejection.
 *
 * Top-level keys only: `.shape` does not recurse, and a rule that quietly checked
 * one level while claiming to check the object would be this file's own subject.
 */
test('a payload supplying every declared key survives the parse intact', () => {
  const losses: string[] = [];
  const drifted: string[] = [];

  for (const [name, c] of Object.entries(CASES)) {
    const schema = schemas[name as keyof typeof schemas] as z.ZodType;
    if (!(schema instanceof z.ZodObject)) continue;

    const declared = Object.keys(schema.shape).sort();
    const fixture = c.valid[0] as Record<string, unknown>;
    const supplied = Object.keys(fixture).sort();

    /*
     * The fixture is the authority, not the schema.
     *
     * The first draft of this test read `declared` and asked whether each key
     * came back — and a mutant deleting `note` from the shape **survived it**,
     * because a field the schema no longer declares is a field the loop no
     * longer asks about. The guard took its expectations from the code under
     * test, so removing the code removed the assertion: `.220`'s defect,
     * reproduced inside the file written about that defect.
     *
     * Comparing the two sets is what closes it, and it closes both directions
     * (`.219`'s shape): a field dropped from the shape leaves the fixture
     * over-supplying, and a field added leaves it under-supplying. Either way
     * this line goes red and a human decides which side was right.
     */
    if (declared.join(',') !== supplied.join(',')) {
      const removed = supplied.filter((k) => !declared.includes(k));
      const added = declared.filter((k) => !supplied.includes(k));
      drifted.push(
        `${name}:` +
          (removed.length ? `\n      fixture sends, schema no longer declares: ${removed.join(', ')}` : '') +
          (added.length ? `\n      schema declares, fixture does not send: ${added.join(', ')}` : '')
      );
      continue;
    }

    const parsed = schema.safeParse(fixture);
    assert.ok(parsed.success, `${name}: valid[0] must parse`);
    const returned = new Set(Object.keys(parsed.data as Record<string, unknown>));
    for (const key of supplied) {
      if (!returned.has(key)) losses.push(`${name}.${key}`);
    }
  }

  assert.deepEqual(
    drifted,
    [],
    'the schema and its fixture no longer agree on the field list:\n    ' +
      drifted.join('\n    ') +
      '\n\n  If a field was removed deliberately, remove it from the fixture in the same commit — ' +
      'and check no client still sends it, because zod will strip it and the request will still return 200.'
  );
  assert.deepEqual(
    losses,
    [],
    'these fields were supplied and did not come back:\n  ' +
      losses.join('\n  ') +
      '\n  That is the `.184` failure: the client sends it, zod drops it, the request succeeds, the data is gone.'
  );
});

/** And the stripping itself is deliberate — pinned so it is a decision, not a surprise. */
test('unknown keys are stripped rather than rejected', () => {
  const r = schemas.mobileSyncSetSchema.safeParse({
    id: 's', exerciseId: 'e', setIndex: 0, reps: 5, weight: 10, completedAt: '2026-07-27',
    fieldTheServerHasNeverHeardOf: 'dropped',
  });
  assert.ok(r.success, 'an unknown key must not fail the request — an older client would stop syncing entirely');
  assert.ok(
    !('fieldTheServerHasNeverHeardOf' in r.data),
    'unknown keys reach no column, which is why a *known* field missing from the shape is invisible — see the test above'
  );
});

test('defaults still default', () => {
  for (const { schema: name, input, expect } of DEFAULTS) {
    const schema = schemas[name as keyof typeof schemas] as z.ZodType;
    const r = schema.safeParse(input);
    assert.ok(r.success, `${name}: the minimal payload must parse`);
    for (const [key, want] of Object.entries(expect)) {
      assert.deepEqual(
        (r.data as Record<string, unknown>)[key],
        want,
        `${name}.${key} no longer defaults to ${JSON.stringify(want)} — a removed default changes what lands in the column and fails no parse`
      );
    }
  }
});

/** The two helpers every route funnels through. */
test('parseJsonBody reports the first issue and passes the parsed value through', () => {
  const ok = parseJsonBody(schemas.checkoutBodySchema, { planId: 'lifetime' });
  assert.deepEqual(ok, { ok: true, data: { planId: 'lifetime' } });

  const bad = parseJsonBody(schemas.checkoutBodySchema, { planId: 'weekly' });
  assert.equal(bad.ok, false);
  assert.ok(!bad.ok && typeof bad.error === 'string' && bad.error.length > 0);

  // Non-objects arrive here whenever a client posts a bare string or null.
  for (const junk of [null, 'a string', 42, []]) {
    const r = parseJsonBody(schemas.checkoutBodySchema, junk);
    assert.equal(r.ok, false, `parseJsonBody accepted ${JSON.stringify(junk)}`);
  }
});

test('parseQuery reads URLSearchParams and rejects what the schema bounds', () => {
  const ok = parseQuery(schemas.fuelSearchQuerySchema, new URLSearchParams('q=chicken'));
  assert.deepEqual(ok, { ok: true, data: { q: 'chicken' } });

  const short = parseQuery(schemas.fuelSearchQuerySchema, new URLSearchParams('q=a'));
  assert.equal(short.ok, false);

  const missing = parseQuery(schemas.fuelBarcodeQuerySchema, new URLSearchParams(''));
  assert.equal(missing.ok, false, 'an absent query param must not read as an empty-string match');

  /*
   * Repeated params collapse to the last value — `Object.fromEntries` over
   * `params.entries()`. Pinned because `?q=a&q=chicken` reaching a route as
   * `chicken` is a decision, and the alternative (an array, which every schema
   * here would reject) is what a reader would otherwise assume.
   */
  const repeated = parseQuery(schemas.fuelSearchQuerySchema, new URLSearchParams('q=first&q=second'));
  assert.deepEqual(repeated, { ok: true, data: { q: 'second' } });
});
