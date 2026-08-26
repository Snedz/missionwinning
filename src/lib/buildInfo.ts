/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.1042` L/R on a finished set (from master `.1041` `e0072ec12`; stamp stays `.1042`; RIR `.1041` / RPE `.1040` / Set kind `.1039` / Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay). */
export const APP_BUILD_LABEL = "2026.07-unified.1042";

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
