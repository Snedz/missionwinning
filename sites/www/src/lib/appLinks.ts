/*
 * Every link that leaves this build. One fact, one home.
 *
 * Why this file exists: the first homepage shipped `/#invite` as the target of
 * its ONE action, and there is no `#invite` id anywhere in sites/www. The hero
 * CTA, the nav CTA and the red poster close all scrolled nowhere — on a page
 * whose whole brief was "one action, repeated". Adding
 * scripts/www-link-contract.mjs then found ten more the same day: the compare
 * rail's ten `/compare/{slug}` links, and the hero demo's `/welcome`.
 *
 * The pattern behind all twelve is one mistake, made once and repeated: this
 * surface was written as if it were the Next app. It is not. `astro build`
 * emits exactly one HTML file. `/welcome`, `/compare/*`, `/private` and
 * `/api/leads` are Next routes on the Vercel origin, and a relative path to any
 * of them 404s on Cloudflare Pages.
 *
 * So they are absolute, and they are all here rather than typed at each call
 * site — which is what makes the eventual move cheap. Which origin serves
 * www.missionwinning.com is still undecided: sites/www/astro.config.mjs and
 * src/lib/seoMetadata.ts both claim it today, and the repo has no _redirects,
 * no wrangler.toml and no deploy workflow. When that is settled, and when a
 * page here starts owning one of these paths, this file is the diff.
 *
 * PUBLIC_APP_ORIGIN overrides the origin so a preview deploy can point at a
 * preview app without a code change.
 */

/*
 * `import.meta.env` is a Vite/Astro inject. Node (the concept builders run
 * under `tsx`) has `import.meta` but no `.env`, and reading a missing object
 * throws — which is how a marketing HTML generator would be unable to name
 * the one URL it is not allowed to invent.
 */
const APP_ORIGIN = (
  (import.meta as ImportMeta & { env?: { PUBLIC_APP_ORIGIN?: string } }).env?.PUBLIC_APP_ORIGIN ||
  'https://www.missionwinning.com'
).replace(/\/$/, '');

/** The marketing homepage on this origin. Wordmark and "Homepage" point here. */
export const HOME_URL = APP_ORIGIN;

/** A route that lives on the Next app, not in this build. */
export function appUrl(pathname: `/${string}`): string {
  return `${APP_ORIGIN}${pathname}`;
}

/*
 * Gated: get an invite. The private gate is the only working capture point in
 * the product — PrivateTeaserClient calls submitLead({ source:
 * 'launch-waitlist' }), which POSTs /api/leads. A static Cloudflare page cannot
 * POST there itself: next.config.js sets `form-action 'self'` and
 * `connect-src 'self'`, so a cross-origin submit is refused by the app's own
 * CSP. Linking to the page that owns the form is the honest version.
 */
export const INVITE_URL = appUrl('/private');

/*
 * Post-flip: start free. `/welcome` is I-Day onboarding. This branch carried
 * the same latent bug as the gated one — a relative `/welcome` would have 404'd
 * the moment PRIVATE_MODE flipped, and nothing would have caught it.
 */
export const START_URL = appUrl('/welcome');
