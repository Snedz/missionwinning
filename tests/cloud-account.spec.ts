import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { audit, shot } from './notebookChecks';

const api = 'http://127.0.0.1:54321';
const mail = 'http://127.0.0.1:54324';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

test('local Supabase: an existing account pulls its workout and adds the guest workout exactly once', async ({ page, request, context }) => {
  test.skip(!process.env.V2_LOCAL_SUPABASE_TEST, 'Start the local legacy-schema stack and configure the web build to opt in.');
  expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe(api);
  expect(Boolean(key)).toBe(true);

  async function account() {
    const email = `${randomUUID()}@example.com`;
    const response = await request.post(`${api}/auth/v1/signup`, {
      headers: { apikey: key }, data: { email, password: randomUUID() },
    });
    expect(response.ok()).toBe(true);
    const { access_token: token, user } = await response.json();
    expect(Boolean(token && user?.id)).toBe(true);
    return { email, id: user.id, headers: { apikey: key, Authorization: `Bearer ${token}` } };
  }

  const athlete = await account();
  const other = await account();
  const workoutPath = `${api}/rest/v1/workout_logs`;
  const profilesPath = `${api}/rest/v1/profiles`;
  const routinesPath = '/api/mobile/sync/routines';
  const nativeRoutine = randomUUID();
  const webRoutine = randomUUID();
  async function seed(owner: Awaited<ReturnType<typeof account>>, name: string) {
    const result = await request.post(workoutPath, {
      headers: owner.headers,
      data: {
        user_id: owner.id, workout_name: name, started_at: '2025-01-01T16:00:00Z',
        completed_at: '2025-01-01T16:01:00Z', duration_seconds: 60, total_volume: 0,
        weight_unit: 'kg',
        exercises: [
          { id: 'old-set-1', exerciseId: 'push-ups', reps: 12, weight: 10, weightUnit: 'kg' },
          { id: 'old-set-2', exerciseId: 'push-ups', reps: 8, weight: 44.09, weightUnit: 'lb' },
        ],
      },
    });
    expect(result.ok()).toBe(true);
  }

  await seed(athlete, 'Existing account workout');
  await seed(other, 'Unrelated account workout');
  expect((await request.patch(profilesPath + '?id=eq.' + athlete.id, {
    headers: athlete.headers,
    data: { units: 'imperial', coach_plan: {
      revision: 7, weekStart: '2025-01-06', daysPerWeek: 3, equipmentProfile: 'dumbbells',
      contextHash: 'legacy-plan', generatedAt: '2025-01-06T10:00:00Z',
      sessions: [{
        id: 'existing-day', dayOffset: 0, kind: 'strength', name: 'Existing account plan',
        focusGroups: ['chest'], status: 'planned', estMinutes: 20,
        exercises: [{ exerciseId: 'push-ups', sets: 2, reps: 10, weight: 22.05, whyKey: 'fixture' }],
      }],
    } },
  })).ok()).toBe(true);
  const native = {
    clientId: nativeRoutine, name: 'Native saved workout', revision: 1, createdAt: '2025-01-01T10:00:00Z',
    exercises: [{ exerciseId: 'push-ups', sets: 3, targetReps: 18, lastWeight: 12 }],
  };
  expect(await (await request.post(routinesPath, {
    headers: athlete.headers, data: { routines: [native] },
  })).json()).toMatchObject({ acks: [{ status: 'ok' }] });
  const foreign = await request.get(`${workoutPath}?user_id=eq.${other.id}`, { headers: athlete.headers });
  expect(foreign.ok()).toBe(true);
  expect(await foreign.json()).toEqual([]);

  async function finishWorkout() {
    await page.goto('/active');
    await page.getByRole('button', { name: 'Start workout' }).click();
    await page.getByRole('button', { name: 'Log set' }).click();
    await page.getByRole('button', { name: 'Finish workout' }).click();
    await expect(page.getByRole('heading', { name: 'Victory.' })).toBeVisible();
  }

  await finishWorkout();
  await page.goto('/profile');
  await expect(page.getByRole('button', { name: 'Email sign-in link' })).toBeVisible();
  await audit(page);
  await shot(page, 'you-account-guest.png');
  await page.getByRole('textbox', { name: 'Account email' }).fill(athlete.email);
  let finishRequest: () => void = () => {};
  const holdRequest = new Promise<void>((resolve) => { finishRequest = resolve; });
  await page.route(`${api}/auth/v1/otp**`, async (route) => {
    await holdRequest;
    await route.abort();
  }, { times: 1 });
  try {
    await page.getByRole('button', { name: 'Email sign-in link' }).click();
    await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await shot(page, 'you-account-sending.png');
  } finally {
    finishRequest();
  }
  await expect(page.getByRole('region', { name: 'Use your existing account.' }).getByRole('alert'))
    .toHaveText('Could not send a link. Verify the address and try again online.');
  await audit(page);
  await shot(page, 'you-account-error.png');
  await page.getByRole('button', { name: 'Email sign-in link' }).click();
  await expect(page.getByText('Check your email for a sign-in link.')).toBeVisible();

  let messageId = '';
  await expect.poll(async () => {
    const result = await request.get(`${mail}/api/v1/search`, { params: { query: `to:${athlete.email}` } });
    const data = await result.json();
    messageId = data.messages?.[0]?.ID;
    return Boolean(messageId);
  }).toBe(true);
  const message = await (await request.get(`${mail}/api/v1/message/${messageId}`)).json();
  const link = String(message.Text).match(/http[^\s)]+\/auth\/v1\/verify[^\s)]+/)?.[0];
  expect(Boolean(link)).toBe(true);
  const verificationURL = new URL(link!);
  expect(verificationURL.origin).toBe(api);
  await page.goto(verificationURL.href);
  await expect(page.getByText('Workouts synced.')).toBeVisible();
  await audit(page);
  await shot(page, 'you-account-synced.png');

  async function cloudNames() {
    const response = await request.get(workoutPath + '?select=workout_name&deleted_at=is.null&order=workout_name', { headers: athlete.headers });
    expect(response.ok()).toBe(true);
    return (await response.json()).map((row: { workout_name: string }) => row.workout_name);
  }
  expect(await cloudNames()).toEqual(['Existing account workout', 'Quick workout']);
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.getByText('Workouts synced.')).toBeVisible();
  expect(await cloudNames()).toEqual(['Existing account workout', 'Quick workout']);
  await page.goto('/history');
  await expect(page.getByText('Existing account workout', { exact: true })).toBeVisible();
  await page.getByText('Existing account workout', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('10 kg');
  await expect(page.getByRole('region', { name: 'Completed workouts' })).toContainText('20 kg');
  await expect(page.getByText('Quick workout', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Unrelated account workout', { exact: true })).toHaveCount(0);

  await expect(page.getByText('Offline ready', { exact: true })).toBeVisible();
  await context.setOffline(true);
  await finishWorkout();
  await page.reload();
  await page.goto('/history');
  await expect(page.getByText('Quick workout', { exact: true })).toHaveCount(2);
  expect(await cloudNames()).toHaveLength(2);
  await page.getByRole('link', { name: 'You', exact: true }).click();
  await expect(page.getByText('Waiting to sync: 1.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sync now' })).toBeDisabled();
  await audit(page);
  await shot(page, 'you-account-offline.png');
  const historyPull = (url: URL) => url.pathname === '/rest/v1/workout_logs' &&
    url.searchParams.get('order') === 'id.asc';
  await page.route(historyPull, (route) => route.abort());
  await context.setOffline(false);
  await expect.poll(cloudNames).toEqual(['Existing account workout', 'Quick workout', 'Quick workout']);
  await page.unroute(historyPull);
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.getByText('Workouts synced.')).toBeVisible({ timeout: 20_000 });
  expect(await cloudNames()).toEqual(['Existing account workout', 'Quick workout', 'Quick workout']);

  await page.getByRole('link', { name: 'Coach', exact: true }).click();
  await expect(page.getByText('Existing account plan', { exact: true })).toBeVisible();
  await expect(page.locator('.citation')).toContainText(/(?:10|20)\s*kg/);
  async function profilePlan() {
    const response = await request.get(profilesPath + '?select=coach_plan,units', { headers: athlete.headers });
    expect(response.ok()).toBe(true);
    const [profile] = await response.json();
    return { revision: profile.coach_plan.revision, weightUnit: profile.coach_plan.weightUnit, units: profile.units };
  }
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Rebuild week' }).click();
  await page.getByRole('link', { name: 'You', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Waiting to sync: 1.')).toBeVisible();
  expect(await profilePlan()).toEqual({ revision: 7, weightUnit: undefined, units: 'imperial' });
  await context.setOffline(false);
  await expect.poll(profilePlan).toEqual({ revision: 8, weightUnit: 'kg', units: 'imperial' });

  await page.getByRole('link', { name: 'Train', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start Native saved workout' })).toBeVisible();
  await page.getByRole('link', { name: 'You', exact: true }).click();
  const authored = { id: webRoutine, name: 'Imported favorite', note: 'Tempo up',
    createdAt: '2025-01-01T10:00:00Z',
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 4, weight: 5 }, { reps: 7, weight: 11 }] }] };
  await page.getByLabel('Import backup').setInputFiles({
    name: 'template.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({
      app: 'mission-winning', version: 1, localKeys: {},
      workoutStore: { state: { savedWorkouts: [authored] } },
    })),
  });
  await expect(page.getByText('Backup imported.', { exact: false })).toBeVisible();
  await expect.poll(async () => {
    const response = await request.get(routinesPath, { headers: athlete.headers });
    expect(response.ok()).toBe(true);
    return (await response.json()).items.find((item: { clientId: string }) => item.clientId === webRoutine);
  }).toMatchObject({
    name: authored.name, exercises: [{
      exerciseId: 'push-ups', sets: 2, targetReps: 4, lastWeight: 5,
      webTemplate: authored.exercises[0], webNote: authored.note,
    }],
  });
  const removed = await request.post(routinesPath, {
    headers: athlete.headers, data: { routines: [{ ...native, revision: 2, deletedAt: '2025-01-02T10:00:00Z' }] },
  });
  expect(removed.ok()).toBe(true);
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.getByText('Workouts synced.')).toBeVisible();
  await page.getByRole('link', { name: 'Train', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start Native saved workout' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Start Imported favorite' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Reps' })).toHaveValue('4');
  await page.getByRole('button', { name: 'Log set' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Reps' })).toHaveValue('7');
  await expect(page.getByRole('spinbutton', { name: 'Added load' })).toHaveValue('11');
  await page.getByRole('link', { name: 'You', exact: true }).click();

  await expect(page.getByText('Workouts synced.')).toBeVisible();
  await page.clock.install();
  let signalPlan: () => void = () => {};
  const planStarted = new Promise<void>((resolve) => { signalPlan = resolve; });
  let releasePlan: () => void = () => {};
  const holdPlan = new Promise<void>((resolve) => { releasePlan = resolve; });
  const planPull = (url: URL) => url.origin === api && url.pathname === '/rest/v1/profiles' &&
    url.searchParams.get('select')?.includes('coach_plan') === true;
  await page.route(planPull, async (route) => {
    signalPlan();
    await holdPlan;
    await route.abort().catch(() => undefined);
  }, { times: 1 });
  try {
    await page.getByRole('button', { name: 'Sync now' }).click();
    await planStarted;
    await expect(page.getByText('Syncing workouts…')).toBeVisible();
    await page.clock.fastForward(11_000);
    await expect(page.getByText('Waiting for a connection to sync workouts.')).toBeVisible();
  } finally {
    releasePlan();
  }
  await page.getByRole('button', { name: 'Sync now' }).click();
  await expect(page.getByText('Workouts synced.')).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Email sign-in link' })).toBeVisible();
  await page.goto('/history');
  await expect(page.getByText('Existing account workout', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Quick workout', { exact: true })).toHaveCount(1);
});
