import type { Metadata } from 'next';
import { routeMetadata } from '@/lib/routeMetadata';
import { AccountPage } from '@/page-components/AccountPage';

export const metadata: Metadata = routeMetadata('account');

type SearchParams = Promise<{ authError?: string | string[] }>;

/**
 * Account first paint is house leftover. `useSearchParams()` plus `dynamic()`
 * + `RouteLoading` made the served HTML a skeleton ("Loading Account…").
 * `?authError=` is resolved here, same shape as `/welcome` `?edit=`.
 */
export default async function AccountRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.authError;
  const initialAuthError = Array.isArray(raw) ? raw[0] : raw;

  return <AccountPage initialAuthError={initialAuthError} />;
}
