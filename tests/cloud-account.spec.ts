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
  async function seed(owner: Awaited<ReturnType<typeof account>>, name: string) {
    const result = await request.post(workoutPath, {
      headers: owner.headers,
      data: {
        user_id: owner.id, workout_name: name, started_at: '2025-01-01T16:00:00Z',
        completed_at: '2025-01-01T16:01:00Z', duration_seconds: 60, total_volume: 0,
        exercises: [{ id: 'old-set-1', exerciseId: 'push-ups', reps: 12, weight: 0 }],
      },
    });
    expect(result.ok()).toBe(true);
  }

  await seed(athlete, 'Existing account workout');
  await seed(other, 'Unrelated account workout');
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
  await context.setOffline(false);
  await expect(page.getByText('Workouts synced.')).toBeVisible({ timeout: 20_000 });
  expect(await cloudNames()).toEqual(['Existing account workout', 'Quick workout', 'Quick workout']);

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Email sign-in link' })).toBeVisible();
  await page.goto('/history');
  await expect(page.getByText('Existing account workout', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Quick workout', { exact: true })).toHaveCount(1);
});
