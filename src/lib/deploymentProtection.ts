/**
 * Reaching a protected Vercel deployment, and refusing to pretend we did.
 *
 * ## The finding (F-035, shard 0 / ops #17)
 *
 * The ungated Preview handed to the survey pipeline answered **302 →
 * `vercel.com/sso-api` on all 19 paths**. The shard recorded *"Train
 * unreachable"*, which is true of the walk and false of the app: nothing was
 * broken, the walker was never let in. A protection page that a tool reports as
 * a product failure is the most expensive kind of false negative, because it
 * costs a survey round and looks like evidence.
 *
 * Verified in this environment before writing any of it: `vercel whoami` →
 * `Logged out`, no `VERCEL_*` variables, no `.vercel/`, and the Vercel MCP
 * server reports `needsAuth`. So no sanctioned access path is available to an
 * agent here, and **`vercel.json` cannot change that** — Deployment Protection
 * is a project setting (Settings → Deployment Protection), reachable from the
 * dashboard or the REST API, never from the repo. Disabling it is also the wrong
 * fix; authenticated access is the right one.
 *
 * ## What this module is for
 *
 * Two jobs, both pure so they can be tested without a network:
 *
 * 1. **Carry credentials when they exist.** `x-vercel-protection-bypass` (the
 *    project's automation secret) or `x-vercel-trusted-oidc-idp-token` (a local
 *    development token). Nothing here invents access; it only uses what the
 *    caller already has, and the moment the founder adds one secret, every smoke
 *    and Playwright run can walk a protected Preview.
 * 2. **Name the wall.** `describeProtectionBlock()` recognises the protection
 *    response so a runner can report *"this deployment is protected"* instead of
 *    nineteen invented product defects.
 *
 * The secret is never logged: callers pass it into headers, and this module has
 * no reason to print it.
 */

/** Header a browser or HTTP client sends to pass Deployment Protection. */
export const BYPASS_HEADER = 'x-vercel-protection-bypass';
/** Persists the bypass across follow-up requests — needed for in-browser walks. */
export const BYPASS_COOKIE_HEADER = 'x-vercel-set-bypass-cookie';
/** Trusted Sources: a local development OIDC token, for the caller's own project. */
export const OIDC_HEADER = 'x-vercel-trusted-oidc-idp-token';

export type ProtectionEnv = {
  /** `VERCEL_AUTOMATION_BYPASS_SECRET` — set by Vercel in every deployment. */
  bypassSecret?: string;
  /** `VERCEL_OIDC_TOKEN` — short-lived, from `vercel env pull` / `vc env run`. */
  oidcToken?: string;
  /**
   * In-browser walks need the bypass to survive redirects, so the cookie form is
   * requested. `'samesitenone'` when the page is loaded in an iframe.
   */
  browser?: boolean;
};

/**
 * Headers that let an automated request through Deployment Protection.
 *
 * Empty when nothing is configured — deliberately, so a caller with no
 * credentials sends a clean request and gets the protection page, which
 * {@link describeProtectionBlock} can then explain. Sending a blank bypass
 * header would turn a diagnosable 302 into a confusing one.
 */
export function protectionHeaders(env: ProtectionEnv = {}): Record<string, string> {
  const headers: Record<string, string> = {};
  const secret = env.bypassSecret?.trim();
  const token = env.oidcToken?.trim();

  if (secret) {
    headers[BYPASS_HEADER] = secret;
    if (env.browser) headers[BYPASS_COOKIE_HEADER] = 'true';
  }
  // Both may be present; they are different mechanisms and Vercel accepts either.
  if (token) headers[OIDC_HEADER] = token;

  return headers;
}

/** Read the two credentials out of a process environment. */
export function protectionEnvFrom(
  source: Record<string, string | undefined>,
  opts: { browser?: boolean } = {}
): ProtectionEnv {
  return {
    bypassSecret: source.VERCEL_AUTOMATION_BYPASS_SECRET || source.SMOKE_BYPASS_SECRET,
    oidcToken: source.VERCEL_OIDC_TOKEN,
    browser: opts.browser,
  };
}

export type ProtectionBlock = {
  /** Where the request was sent, for the message. */
  path: string;
  status: number;
  /** True when Vercel, not the app, refused the request. */
  protected: boolean;
  detail: string;
};

const SSO_LOCATION = /vercel\.com\/sso-api|vercel\.com\/login|\/\.well-known\/vercel-user-meta/i;
const SSO_BODY =
  /Authentication Required|Vercel Authentication|_vercel_sso_nonce|Deployment Protection/i;

/**
 * Does this response mean *Vercel* said no, rather than the app?
 *
 * Checked three ways because the wall shows up differently depending on the
 * client: a 302 whose `location` is the SSO endpoint (what shard 0 saw), a
 * 401/403 with the protection page as its body, and the `_vercel_sso_nonce`
 * cookie the challenge sets. The application's own 401s must **not** match —
 * those are a real product finding and belong to the app.
 */
export function describeProtectionBlock(input: {
  path: string;
  status: number;
  location?: string | null;
  body?: string | null;
}): ProtectionBlock {
  const { path, status } = input;
  const location = input.location ?? '';
  const body = input.body ?? '';

  const redirectedToSso = status >= 300 && status < 400 && SSO_LOCATION.test(location);
  const challengedInPlace = (status === 401 || status === 403) && SSO_BODY.test(body);
  const isProtected = redirectedToSso || challengedInPlace;

  if (!isProtected) {
    return { path, status, protected: false, detail: `${status}` };
  }

  return {
    path,
    status,
    protected: true,
    detail:
      `Vercel Deployment Protection answered for ${path} (${status}) — the deployment ` +
      `refused the request, so nothing here describes the app. Set ` +
      `VERCEL_AUTOMATION_BYPASS_SECRET (Project → Settings → Deployment Protection → ` +
      `Protection Bypass for Automation) or provide VERCEL_OIDC_TOKEN, then re-run. ` +
      `Do not report these paths as product defects.`,
  };
}

/**
 * The one-line verdict for a whole run.
 *
 * A walk where *every* path was refused is not a set of findings; it is one
 * finding about access. Shard 0 recorded nineteen.
 */
export function protectionSummary(blocks: ProtectionBlock[]): string | null {
  const refused = blocks.filter((b) => b.protected);
  if (refused.length === 0) return null;
  return (
    `${refused.length}/${blocks.length} paths were refused by Vercel Deployment ` +
    `Protection, not by the app. This run measured access, not the product (F-035).`
  );
}
