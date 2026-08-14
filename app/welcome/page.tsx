import type { Metadata } from 'next';
import { WelcomePage } from '@/page-components/WelcomePage';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const metadata: Metadata = publicPageMetadata({
  title: 'Welcome — I-Day',
  description: 'Start your Mission Winning path in under three minutes. No account required.',
  path: '/welcome',
});

type SearchParams = Promise<{ edit?: string | string[] }>;

/**
 * `.765` — `?edit=1` is resolved here, not by `useSearchParams()` inside the page.
 *
 * That hook made the whole of I-Day a Suspense child, and since this route
 * prerendered, the HTML Vercel served was the fallback: one `aria-hidden`
 * skeleton card, zero words. `/welcome` is the public entry the guidebook, the
 * `/compare` redirect and the gate all point at, so its first paint was a grey
 * box for every cold visitor and every crawler. Reading the query on the server
 * costs this route its static prerender and buys back server-rendered text.
 */
export default async function WelcomeRoute({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const rawEdit = sp.edit;
  const edit = (Array.isArray(rawEdit) ? rawEdit[0] : rawEdit) === '1';

  return <WelcomePage initialEdit={edit} />;
}
