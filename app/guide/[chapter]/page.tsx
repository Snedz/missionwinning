import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuidePublicChapterPage } from '@/page-components/GuidePublicChapterPage';
import { getGuideChapter } from '@/lib/guidePublic';
import { breadcrumbJsonLd, guideChapterJsonLd } from '@/lib/publicSeo';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { publicPageMetadata, siteBaseUrl } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

type Props = { params: Promise<{ chapter: string }> };

export async function generateStaticParams() {
  return BEYOND_THE_BASICS_CHAPTERS.map((c) => ({ chapter: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: id } = await params;
  const data = getGuideChapter(id);
  if (!data) return { title: 'Guide' };
  return publicPageMetadata({
    title: `${data.chapter.title} — Foundations Guide`,
    description: data.chapter.subtitle,
    path: `/guide/${id}`,
  });
}

export default async function GuideChapterRoute({ params }: Props) {
  const { chapter: id } = await params;
  const data = getGuideChapter(id);
  if (!data) notFound();
  const base = siteBaseUrl();
  const jsonLd = [
    guideChapterJsonLd(data.chapter, base),
    breadcrumbJsonLd(
      [
        { name: 'Guide', path: '/guide' },
        { name: data.chapter.title, path: `/guide/${data.chapter.id}` },
      ],
      base
    ),
  ];
  return (
    <GuidePublicChapterPage
      chapter={data.chapter}
      prev={data.prev}
      next={data.next}
      jsonLd={jsonLd}
    />
  );
}
