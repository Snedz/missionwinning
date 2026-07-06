import { NextRequest } from 'next/server';

type TestRequestInit = {
  method?: string;
  body?: string;
  headers?: HeadersInit;
  cookies?: Record<string, string>;
};

/** Build a NextRequest for route handler unit tests. */
export function makeNextRequest(url: string, init?: TestRequestInit): NextRequest {
  const headers = new Headers(init?.headers);
  if (init?.cookies) {
    const cookie = Object.entries(init.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    headers.set('cookie', cookie);
  }
  return new NextRequest(url, {
    method: init?.method,
    body: init?.body,
    headers,
  });
}
