import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { PrivateTeaserClient } from './PrivateTeaserClient';
import { GatePendingChrome } from './GatePendingChrome';
import { hasServerPrivateAccess } from '@/lib/privateGateServer';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import { GATED_WWW_HONESTY } from '@/lib/gatedWwwHonesty';
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

  return (
    <div className="mw-gate">
      <Suspense
        fallback={
          <GatePendingChrome
            isInvitee={Boolean(initialInvite)}
            status={GATED_WWW_HONESTY.gateLoading}
          />
        }
      >
        <PrivateTeaserClient initialInvite={initialInvite} />
      </Suspense>
    </div>
  );
}
