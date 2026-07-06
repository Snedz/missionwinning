import * as Sentry from '@sentry/nextjs';
import { sentryBaseInitOptions } from './src/lib/sentryCommon';

const base = sentryBaseInitOptions();
if (base.enabled) {
  Sentry.init({
    ...base,
    integrations: [Sentry.browserTracingIntegration()],
  });
}
