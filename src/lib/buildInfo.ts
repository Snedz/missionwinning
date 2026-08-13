/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.760` after-save vs-last token on working sets; not ghost prefill. */
export const APP_BUILD_LABEL = "2026.07-unified.760";

/**
 * Athlete-facing marketing version. Distinct from `APP_BUILD_LABEL`, which
 * `/api/health` and deploy smoke keep as the honest unified ship id.
 *
 * Language is free beta — not invite-only, not v1.0.
 */
export const APP_PUBLIC_VERSION = "0.1 (beta)";

/** Full product stamp: `Mission Winning 0.1 (beta)`. */
export const APP_PUBLIC_PRODUCT_VERSION = `Mission Winning ${APP_PUBLIC_VERSION}`;

/**
 * English status-bar line for the public SEO shell (EN-only by construction).
 * Translated chrome interpolates `{{productVersion}}` with the same product stamp.
 */
export const APP_PUBLIC_STATUS_LINE_EN = `${APP_PUBLIC_PRODUCT_VERSION} — free beta. Offline logging plus Mission Coach from your logs.`;
