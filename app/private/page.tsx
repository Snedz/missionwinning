import { Suspense } from 'react';
import { PrivateTeaserClient } from './PrivateTeaserClient';

type SearchParams = Promise<{ invite?: string | string[] }>;

export default async function PrivatePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.invite;
  const initialInvite = (Array.isArray(raw) ? raw[0] : raw)?.trim() || '';

  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm"
          data-mw-invitee={initialInvite ? '1' : '0'}
        >
          Loading…
        </div>
      }
    >
      <PrivateTeaserClient initialInvite={initialInvite} />
    </Suspense>
  );
}
