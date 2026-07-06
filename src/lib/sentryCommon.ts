/**
 * Shared Sentry options — env-gated like PostHog (`NEXT_PUBLIC_POSTHOG_KEY`).
 * No Sentry SDK import here so client + server can share the gate safely.
 */

export function isSentryEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

export function sentryEnvironment(): string {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
}

/** Base init options for client, server, and edge Sentry configs. */
export function sentryBaseInitOptions() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: sentryEnvironment(),
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    sendDefaultPii: false,
  };
}
