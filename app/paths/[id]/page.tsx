import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { notFound } from 'next/navigation';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { LearnPathPublicPage } from '@/page-components/LearnPathPublicPage';

export const dynamic = 'force-static';

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return FREE_LEARN_PATHS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = FREE_LEARN_PATHS.find((p) => p.id === id);
  if (!path) return { title: 'Learning path' };
  return publicPageMetadata({
    title: `${path.title} — free learning path`,
    description: path.subtitle,
    path: `/paths/${id}`,
  });
}

export default async function PathDetailRoute({ params }: Props) {
  const { id } = await params;
  const path = FREE_LEARN_PATHS.find((p) => p.id === id);
  if (!path) notFound();
  return <LearnPathPublicPage path={path} />;
}
