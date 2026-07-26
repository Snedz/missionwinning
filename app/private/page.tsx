import { Suspense } from 'react';
import { PrivateTeaserClient } from './PrivateTeaserClient';
import './gate.css';

type SearchParams = Promise<{ invite?: string | string[] }>;

export default async function PrivatePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.invite;
  const initialInvite = (Array.isArray(raw) ? raw[0] : raw)?.trim() || '';

  return (
    <div className="mw-gate">
      <Suspense
        fallback={
          <div
            className="gate-shell gate-center"
            data-mw-invitee={initialInvite ? '1' : '0'}
          >
            Loading…
          </div>
        }
      >
        <PrivateTeaserClient initialInvite={initialInvite} />
      </Suspense>
    </div>
  );
}
