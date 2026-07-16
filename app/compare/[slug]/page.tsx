import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareStoryPage } from '@/page-components/CompareStoryPage';
import { COMPARE_STORIES, getCompareStory } from '@/data/compareStories';
import { publicPageMetadata } from '@/lib/seoMetadata';

export const dynamic = 'force-static';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPARE_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getCompareStory(slug);
  if (!story) return { title: 'Compare' };
  return publicPageMetadata({
    title: `${story.title} — Compare`,
    description: story.subtitle,
    path: `/compare/${slug}`,
  });
}

export default async function CompareStoryRoute({ params }: Props) {
  const { slug } = await params;
  const story = getCompareStory(slug);
  if (!story) notFound();
  return <CompareStoryPage story={story} />;
}
