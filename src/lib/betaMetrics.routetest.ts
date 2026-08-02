/**
 * Who may read the founder dashboard, and what it answers when it cannot read.
 *
 * `.260` — `betaMetricsServer.ts` is `server-only` and was loaded by no test.
 * `isBetaAdminEmail` is the allowlist standing between an arbitrary signed-in
 * account and the beta funnel, the lead sources and every invitee's email address;
 * the compute functions decide what the panel shows when Supabase is unreachable.
 *
 * `.214`'s rule is the one being pinned on the read side: **a misconfigured server
 * must not look like an empty result.** `null` and "no beta users" prescribe
 * opposite actions, and the panel keeps them visually distinct only if these
 * functions keep them distinct first.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv.ts';
import {
  isBetaAdminEmail,
  computeBetaFunnelAggregate,
  computeWeek4Retention,
  computeReferralStats,
  computeInviteFunnel,
} from '@/lib/betaMetricsServer';

let snapshot: NodeJS.ProcessEnv;
beforeEach(() => {
  snapshot = snapshotEnv();
});
afterEach(() => {
  restoreEnv(snapshot);
});

describe('beta admin allowlist', () => {
  it('admits only the configured addresses', () => {
    setTestEnv('BETA_ADMIN_EMAILS', 'founder@example.com, second@example.com');
    assert.equal(isBetaAdminEmail('founder@example.com'), true);
    assert.equal(isBetaAdminEmail('second@example.com'), true);
    assert.equal(isBetaAdminEmail('someone@example.com'), false);
  });

  it('is case-insensitive on both sides', () => {
    setTestEnv('BETA_ADMIN_EMAILS', 'Founder@Example.COM');
    assert.equal(
      isBetaAdminEmail('FOUNDER@example.com'),
      true,
      'Supabase returns the address as the user typed it at signup'
    );
  });

  it('tolerates whitespace and stray commas in the env list', () => {
    setTestEnv('BETA_ADMIN_EMAILS', '  founder@example.com ,, , ');
    assert.equal(isBetaAdminEmail('founder@example.com'), true);
  });

  /**
   * The one that must never open. An unset allowlist has to deny everyone — the
   * empty-string split yields `['']`, and a filter that let that through would
   * make every signed-in account an admin the moment the env var is missing,
   * which is exactly the state a fresh deploy is in.
   */
  it('fails closed when the allowlist is unset or empty', () => {
    for (const value of [undefined, '', '   ', ',,,']) {
      setTestEnv('BETA_ADMIN_EMAILS', value);
      assert.equal(
        isBetaAdminEmail('anyone@example.com'),
        false,
        `BETA_ADMIN_EMAILS=${JSON.stringify(value)} must admit nobody`
      );
      assert.equal(isBetaAdminEmail(''), false, 'and an empty email is never an admin');
    }
  });

  it('rejects absent identities without throwing', () => {
    setTestEnv('BETA_ADMIN_EMAILS', 'founder@example.com');
    assert.equal(isBetaAdminEmail(null), false);
    assert.equal(isBetaAdminEmail(undefined), false);
  });

  /*
   * Falsification note — one mutant survived here and it is **equivalent**, not a
   * gap.
   *
   * Removing `.filter(Boolean)` leaves `allowed = ['']` when the env var is unset.
   * That looks alarming and is inert: the only address `[''].includes(...)` can
   * match is the empty string, and `if (!email) return false` has already refused
   * it. Checked rather than reasoned about — 81 combinations of nine env values
   * against nine email values, zero behavioural differences.
   *
   * So the two defences are redundant *by design*, and a test written to kill that
   * mutant would be pinning the implementation rather than the rule. The rule —
   * an unset allowlist admits nobody — is asserted above and holds either way.
   * Recorded so the next person does not spend the evening I nearly did.
   */
});

describe('a dashboard that cannot read says so, rather than showing zero', () => {
  /*
   * No service role → `getSupabaseAdmin()` returns null → every compute returns
   * `null`. `.214`: a 503-shaped answer, not `[]`. The distinction is the whole
   * point — "nobody signed up" and "I could not ask" prescribe opposite actions,
   * and the second one is the beta gate, not a quiet week.
   */
  beforeEach(() => {
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', undefined);
    setTestEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
    setTestEnv('SUPABASE_URL', undefined);
  });

  it('returns null from every panel query with no service role', async () => {
    for (const [name, fn] of [
      ['funnel aggregate', computeBetaFunnelAggregate],
      ['week-4 retention', computeWeek4Retention],
      ['referral stats', computeReferralStats],
      ['invite funnel', computeInviteFunnel],
    ] as const) {
      const result = await fn();
      assert.equal(
        result,
        null,
        `${name} must return null, not an empty aggregate — a zeroed dashboard reads as ` +
          'a failed beta when the truth is a missing key'
      );
    }
  });
});
