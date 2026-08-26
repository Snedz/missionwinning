/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.1016` This session as a file they own (from master `.1015` Next cite is BW, not 0 kg, on assisted 0 `4046afd9`; stamp stays `.1016`; keep assisted cite `.1015` + duration cite `.1014` + import `.1013` + titles `.1012` + export `.1011` + library skip `.1010` + BW cite `.1009`). */
export const APP_BUILD_LABEL = "2026.07-unified.1016";

/**
 * Semver for athletes. Distinct from `APP_BUILD_LABEL`, which `/api/health`
 * and deploy smoke keep as the honest unified ship id.
 *
 * 0.1.0 is the first named Alpha. Not v1.0. Not a public flip.
 */
export const APP_PUBLIC_VERSION = "0.1.0";

/** Channel word shown with the semver: Alpha 0.1.0. */
export const APP_PUBLIC_STAGE = "Alpha";

/** Full product stamp: `Mission Winning Alpha 0.1.0`. */
export const APP_PUBLIC_PRODUCT_VERSION = `Mission Winning ${APP_PUBLIC_STAGE} ${APP_PUBLIC_VERSION}`;

/**
 * English status-bar line for the public SEO shell (EN-only by construction).
 * Translated chrome interpolates `{{productVersion}}` with the same product stamp.
 */
export const APP_PUBLIC_STATUS_LINE_EN = `${APP_PUBLIC_PRODUCT_VERSION} — open alpha. Offline logging plus Mission Coach from your logs.`;
