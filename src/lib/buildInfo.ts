/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.1045` Lift note on a finished exercise (from master `.1044` `64277eb80`; stamp stays `.1045`; Load % `.1044` / Tempo `.1043` / L/R `.1042` / RIR `.1041` / RPE `.1040` stay). */
export const APP_BUILD_LABEL = "2026.07-unified.1045";

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
