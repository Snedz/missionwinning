import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuidePublicChapterPage } from '@/page-components/GuidePublicChapterPage';
import { getGuideChapter } from '@/lib/guidePublic';
import { guideChapterJsonLd } from '@/lib/publicSeo';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';

export const dynamic = 'force-static';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://missionwinning.com';

type Props = { params: Promise<{ chapter: string }> };

export async function generateStaticParams() {
  return BEYOND_THE_BASICS_CHAPTERS.map((c) => ({ chapter: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: id } = await params;
  const data = getGuideChapter(id);
  if (!data) return { title: 'Guide' };
  return {
    title: `${data.chapter.title} — Foundations Guide`,
    description: data.chapter.subtitle,
  };
}

export default async function GuideChapterRoute({ params }: Props) {
  const { chapter: id } = await params;
  const data = getGuideChapter(id);
  if (!data) notFound();
  const jsonLd = guideChapterJsonLd(data.chapter, base);
  return (
    <GuidePublicChapterPage
      chapter={data.chapter}
      prev={data.prev}
      next={data.next}
      jsonLd={jsonLd}
    />
  );
}
