/** Shown on Profile so testers can confirm the deployed build. Bump when shipping UI to master. `.1005` Start history from this date (rebased onto master `.1004` Hide this exercise `b48e54b0`; stamp stays `.1005`; keep hide `.1004` + delete `.1003` + merge `.1002` + pause `.1001` + backfill `.1000` + in-set PR `.999` + reorder `.998` + History Edit `.997` + note+pin `.996` + rest `.995` + set-row type `.994` + history `.993` + custom `.992` + Start this again `.991` + Track trend `.989` + EMOM `.988` + drop-set `.986` + warmup `.985` + notes `.983` + resume `.963` + notebook `.960`). */
export const APP_BUILD_LABEL = "2026.07-unified.1005";

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
