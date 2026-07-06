import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { isSentryEnabled } from '@/lib/sentryCommon';

export type ApiLogEntry = {
  route: string;
  method: string;
  status: number;
  durationMs: number;
  error?: boolean;
};

/** Structured JSON request log — only when Sentry DSN is configured (prod observability). */
export function logApiRequest(entry: ApiLogEntry): void {
  if (!isSentryEnabled()) return;
  console.info(JSON.stringify({ type: 'api_request', ...entry }));
}

export function captureApiException(
  error: unknown,
  context: { route: string; method: string }
): void {
  if (!isSentryEnabled()) return;
  Sentry.captureException(error, {
    tags: { api_route: context.route, http_method: context.method },
  });
}

type SingleRouteHandler = (
  request: NextRequest
) => Promise<Response> | Response;

type ContextRouteHandler<TContext> = (
  request: NextRequest,
  context: TContext
) => Promise<Response> | Response;

export function withApiLogging(
  routeId: string,
  handler: SingleRouteHandler
): (request: NextRequest) => Promise<Response>;
export function withApiLogging<TContext>(
  routeId: string,
  handler: ContextRouteHandler<TContext>
): (request: NextRequest, context: TContext) => Promise<Response>;
export function withApiLogging<TContext>(
  routeId: string,
  handler: ContextRouteHandler<TContext> | SingleRouteHandler
) {
  return async (request: NextRequest, context?: TContext) => {
    const started = Date.now();
    const method = request.method;

    try {
      const response = await (handler as ContextRouteHandler<TContext>)(request, context as TContext);
      logApiRequest({
        route: routeId,
        method,
        status: response.status,
        durationMs: Date.now() - started,
      });
      return response;
    } catch (error) {
      captureApiException(error, { route: routeId, method });
      logApiRequest({
        route: routeId,
        method,
        status: 500,
        durationMs: Date.now() - started,
        error: true,
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
