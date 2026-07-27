import { test, expect } from '@playwright/test';

/**
 * Commander's intent must load for a signed-out visitor.
 *
 * `/api/coach/plan-voice` used to 401 whenever `hasAppAccess` was false — no
 * private-gate cookie and no Supabase session. That is the product's own
 * default state ("no account required to start"), so a free visitor on /coach
 * got a permanent "Could not load briefing" card. The cost gate sat in front of
 * the branch that decides whether any cost is incurred: the rules briefing is
 * local, free, and exists precisely for this case.
 *
 * Found by the founder on a phone, not by a test — this endpoint had no
 * coverage at all, signed-out or otherwise. Tagged `@gate` so it cannot regress
 * quietly again.
 */

const PLAN_BODY = {
  plan: {
    weekStart: '2026-07-27',
    sessions: [{ name: 'Push A', kind: 'strength', whyKeys: ['progressiveOverload'] }],
  },
  readiness: 50,
  strain: 40,
  recovery: 60,
  premium: false,
};

test.describe('Coach voice briefing @gate', () => {
  test('a signed-out visitor gets the free rules briefing, not a 401', async ({ request }) => {
    const res = await request.post('/api/coach/plan-voice', { data: PLAN_BODY });

    expect(res.status(), 'signed-out visitors must not be locked out of the briefing').toBe(200);

    const body = (await res.json()) as { message: string; source: string };

    // Rules, not LLM: no account means no premium, and the LLM path costs money.
    expect(body.source, 'a signed-out visitor must never reach the LLM path').toBe('rules');

    // The card translates a `coach*` key; an unresolvable one renders the raw
    // key to the user, which is how a "working" endpoint can still look broken.
    expect(body.message).toMatch(/^coachVoice/);
  });

  test('a malformed plan is rejected rather than briefed', async ({ request }) => {
    const res = await request.post('/api/coach/plan-voice', { data: { plan: 'not a plan' } });
    expect(res.status(), 'schema validation still applies').toBe(400);
  });

  /**
   * No screen may print a translation key at a user.
   *
   * Found on the same phone review: `coachWhyCompound` rendered raw under a real
   * set, because `PlanSessionCard` passed `defaultValue: ex.whyKey` — so an
   * unresolved key became its own copy. The key exists nowhere in the source; it
   * is baked into plans persisted by an older build, and plans regenerate weekly,
   * so it would have shown for days.
   *
   * Asserted across the app rather than on Coach alone: the same `t(key,
   * { defaultValue: key })` shape is easy to reintroduce anywhere, and a key is
   * recognisable by its shape.
   */
  const KEY_SHAPE = /\b(coach|today|active|fuel|nav|welcome)[A-Z][A-Za-z]{4,}\b/;

  for (const path of ['/coach', '/log', '/active'] as const) {
    test(`${path} renders no raw translation keys @gate`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const text = await page.locator('body').innerText();
      const leaked = text.match(KEY_SHAPE);
      expect(leaked, `${path} printed a translation key: ${leaked?.[0]}`).toBeNull();
    });
  }
});
