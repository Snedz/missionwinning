import { Suspense } from 'react';
import type { Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { PrivateTeaserClient } from './PrivateTeaserClient';
import './gate.css';

// Phase 0 of the Modernist rebrand: Archivo is loaded for this route only —
// the Phase 1 font swap moves it into app/layout.tsx for the whole app.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
});

// Paper browser chrome on the gate while the global themeColor is still navy.
export const viewport: Viewport = {
  themeColor: '#f3f2f2',
};

type SearchParams = Promise<{ invite?: string | string[] }>;

export default async function PrivatePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.invite;
  const initialInvite = (Array.isArray(raw) ? raw[0] : raw)?.trim() || '';

  return (
    <div className={`mw-gate ${archivo.className}`}>
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
