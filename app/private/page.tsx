import { redirect } from 'next/navigation';
import { PrivateTeaserClient } from './PrivateTeaserClient';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import './gate.css';

type SearchParams = Promise<{ invite?: string | string[]; next?: string | string[] }>;

export default async function PrivatePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  if (await hasServerPrivateAccess()) {
    const rawNext = sp.next;
    const next = (Array.isArray(rawNext) ? rawNext[0] : rawNext)?.trim();
    redirect(privateGateReturnPath(next));
  }

  const raw = sp.invite;
  const initialInvite = (Array.isArray(raw) ? raw[0] : raw)?.trim() || '';
  const rawNextParam = sp.next;
  const initialNext =
    (Array.isArray(rawNextParam) ? rawNextParam[0] : rawNextParam)?.trim() || '';

  /*
   * `.745` — the gate reads its query here, not in the client, so this page has
   * no Suspense boundary and the poster is server-rendered.
   *
   * `useSearchParams()` in the teaser put the entire gate behind a fallback, and
   * the fallback was the word "Loading…". With PRIVATE_MODE on, `/` redirects
   * here, so that fallback was the whole of www for anyone whose JS had not run.
   */
  return (
    <div className="mw-gate">
      <PrivateTeaserClient initialInvite={initialInvite} initialNext={initialNext} />
    </div>
  );
}
