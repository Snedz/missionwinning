/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.988` EMOM/AMRAP timer (title `.987`; past master `.986` drop-set rest-zero `9c3b2ce6`; keep drop-set `.986` + warmup `.985` + notes `.983` + 1RM `.981` + supersets `.980` + Learn `.978` + week strip `.977` + Track `.976` + Move `.974` + cues `.973` + honesty `.971` + tags `.970` + RPE `.967` + Fuel `.965` + resume `.963`). */
export const APP_BUILD_LABEL = "2026.07-unified.988";

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
