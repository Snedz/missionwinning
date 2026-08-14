import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  BYPASS_COOKIE_HEADER,
  BYPASS_HEADER,
  OIDC_HEADER,
  describeProtectionBlock,
  protectionEnvFrom,
  protectionHeaders,
  protectionSummary,
} from './deploymentProtection';

const ROOT = join(import.meta.dirname, '../..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/** Strip comments so a rule described in prose cannot satisfy a guard. */
function code(rel: string): string {
  return read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('deployment protection — credentials', () => {
  it('sends nothing when the caller has no credentials', () => {
    /*
     * Deliberate: a blank bypass header turns a diagnosable 302 into a confusing
     * one. With no secret we want the plain protection response, which
     * describeProtectionBlock can then explain.
     */
    assert.deepEqual(protectionHeaders({}), {});
    assert.deepEqual(protectionHeaders({ bypassSecret: '', oidcToken: '   ' }), {});
  });

  it('uses the header names Vercel actually accepts', () => {
    // Wrong names fail silently — the request just gets the wall. Pin them.
    assert.equal(BYPASS_HEADER, 'x-vercel-protection-bypass');
    assert.equal(BYPASS_COOKIE_HEADER, 'x-vercel-set-bypass-cookie');
    assert.equal(OIDC_HEADER, 'x-vercel-trusted-oidc-idp-token');
    // Not x-vercel-oidc-token: that carries a token *into* a Function instead.
    assert.notEqual(OIDC_HEADER, 'x-vercel-oidc-token');
  });

  it('asks for the bypass cookie only for browser walks', () => {
    const curl = protectionHeaders({ bypassSecret: 's3cret' });
    assert.equal(curl[BYPASS_HEADER], 's3cret');
    assert.ok(
      !(BYPASS_COOKIE_HEADER in curl),
      'a one-shot fetch does not need the cookie; only a redirecting browser walk does'
    );

    const browser = protectionHeaders({ bypassSecret: 's3cret', browser: true });
    assert.equal(browser[BYPASS_COOKIE_HEADER], 'true');
  });

  it('reads both credential shapes out of the environment', () => {
    const env = protectionEnvFrom({
      VERCEL_AUTOMATION_BYPASS_SECRET: 'abc',
      VERCEL_OIDC_TOKEN: 'xyz',
    });
    const headers = protectionHeaders(env);
    assert.equal(headers[BYPASS_HEADER], 'abc');
    assert.equal(headers[OIDC_HEADER], 'xyz');
  });

  it('never leaks the secret into the module surface', () => {
    // The secret travels in a header and is never printed. No console here.
    assert.ok(!code('src/lib/deploymentProtection.ts').includes('console.'));
  });
});

describe('deployment protection — telling a locked door from a broken room', () => {
  it('recognises the shape shard 0 actually hit', () => {
    // ops #17: all 19 paths answered 302 → vercel.com/sso-api.
    const block = describeProtectionBlock({
      path: '/active',
      status: 302,
      location: 'https://vercel.com/sso-api?url=https%3A%2F%2Fmissionwinning-git-abc.vercel.app',
    });
    assert.equal(block.protected, true);
    assert.match(block.detail, /Deployment Protection/);
    assert.match(block.detail, /VERCEL_AUTOMATION_BYPASS_SECRET/);
    assert.match(
      block.detail,
      /not report these paths as product defects/,
      'the message must stop the next survey from filing the wall as a finding'
    );
  });

  it('recognises the in-place challenge too', () => {
    const block = describeProtectionBlock({
      path: '/log',
      status: 401,
      body: '<html><title>Authentication Required</title>_vercel_sso_nonce</html>',
    });
    assert.equal(block.protected, true);
  });

  it("does not blame Vercel for the app's own refusals", () => {
    /*
     * The falsifiable half. If this ever returns `protected: true`, a real
     * product defect — an API that wrongly 401s, a gate that wrongly redirects —
     * gets excused as "you were not logged in" and stops being fixed.
     */
    const appUnauthorized = describeProtectionBlock({
      path: '/api/coach/daily-insight',
      status: 401,
      body: JSON.stringify({ error: 'unauthorized' }),
    });
    assert.equal(appUnauthorized.protected, false);

    const gateRedirect = describeProtectionBlock({
      path: '/log',
      status: 307,
      location: '/private?next=%2Flog',
    });
    assert.equal(
      gateRedirect.protected,
      false,
      'our own private gate is the product working, not a wall in front of it'
    );

    const ok = describeProtectionBlock({ path: '/', status: 200, body: 'Train anywhere' });
    assert.equal(ok.protected, false);
  });

  it('summarises a refused run as one access finding, not many product ones', () => {
    const blocks = ['/', '/active', '/log'].map((path) =>
      describeProtectionBlock({ path, status: 302, location: 'https://vercel.com/sso-api' })
    );
    const summary = protectionSummary(blocks);
    assert.ok(summary);
    assert.match(summary, /3\/3/);
    assert.match(summary, /measured access, not the product/);

    assert.equal(
      protectionSummary([describeProtectionBlock({ path: '/', status: 200 })]),
      null,
      'a reachable deployment must stay silent — noise here would train readers to ignore it'
    );
  });
});

describe('deployment protection — the walkers can authenticate', () => {
  /*
   * Scope, stated so the name cannot outgrow the check: this covers runners
   * written in TypeScript that fetch a deployment. Those are the ones that
   * *can* share one definition of the header rules; `.mjs` runners are started
   * by bare `node` (asserted below) and cannot import a `.ts` module at all.
   *
   * That is not a loophole for a future page walk: the two tools that actually
   * walk the product — the curl smoke and the Playwright suite — are both
   * TypeScript and both covered here by discovery, not by name.
   */
  function typescriptRunners(): string[] {
    const out: string[] = [];
    for (const name of readdirSync(join(ROOT, 'scripts'))) {
      if (!name.endsWith('.ts')) continue;
      const body = read(`scripts/${name}`);
      if (body.includes('SMOKE_BASE_URL') && /fetch\(/.test(body)) out.push(`scripts/${name}`);
    }
    out.push('playwright.config.ts');
    return out.sort();
  }

  it('wires shared credentials into every TypeScript runner that fetches a deployment', () => {
    const runners = typescriptRunners();
    assert.ok(
      runners.includes('scripts/gate-smoke.ts') && runners.includes('playwright.config.ts'),
      `discovery must find the two real walkers; found ${runners.join(', ')}`
    );

    const unwired = runners.filter((rel) => {
      const body = code(rel);
      const imports = /from '(\.\.\/src|\.\/src)\/lib\/deploymentProtection'/.test(body);
      return !imports || !/protectionHeaders\(/.test(body);
    });

    assert.deepEqual(
      unwired,
      [],
      `these can reach a protected deployment but cannot authenticate to it: ${unwired.join(', ')}`
    );
  });

  it('keeps the reason .mjs runners are exempt from going stale', () => {
    /*
     * The exemption is a fact about how they start, not a judgement about which
     * ones matter. Move any of them to `tsx` and it can — and therefore must —
     * share the helper, so this goes red and forces the wiring.
     */
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    const mjsRunners = Object.entries(pkg.scripts).filter(([, cmd]) => cmd.includes('.mjs'));
    assert.ok(mjsRunners.length > 0, 'expected node-run scripts to exist');

    for (const [name, cmd] of mjsRunners) {
      assert.ok(
        /(^|\s)node\s/.test(cmd),
        `npm run ${name} no longer runs bare node (${cmd}) — it can import the shared helper now`
      );
    }
  });

  it('the curl walk sends the credentials it computed', () => {
    /*
     * Computing headers and not attaching them is the failure this guard exists
     * for: `protectionHeaders(` would still appear in the file while every
     * request went out bare. So assert the *use*, at the fetch.
     *
     * Only two spellings can merge headers into a fetch init here — spreading
     * into the `headers` object, or Object.assign onto it — so the list is
     * closed; anything else is not a merge.
     */
    const smoke = code('scripts/gate-smoke.ts');
    const spreadIntoHeaders = /headers:\s*\{\s*\.\.\.authHeaders/.test(smoke);
    const assignedOntoHeaders = /Object\.assign\(\s*\{[^}]*\}\s*,\s*authHeaders/.test(smoke);
    assert.ok(
      spreadIntoHeaders || assignedOntoHeaders,
      'gate-smoke computes credentials but never attaches them to the request'
    );
  });

  it('the curl walk prints the verdict, not just computes it', () => {
    const smoke = code('scripts/gate-smoke.ts');
    assert.match(smoke, /describeProtectionBlock\(/);
    // The summary must reach stdout: bind it, then log that binding.
    assert.match(smoke, /const\s+protection\s*=\s*protectionSummary\(/);
    assert.ok(
      /console\.log\([^)]*\$\{protection\}|console\.log\(\s*protection\s*[,)]/.test(smoke),
      'detecting the wall and not printing it would be the same failure in a new place'
    );
  });

  it('the browser walk carries the headers into the context', () => {
    const config = code('playwright.config.ts');
    assert.match(config, /extraHTTPHeaders/);
    assert.match(config, /browser: true/, 'a redirecting walk needs the bypass cookie');
  });
});
