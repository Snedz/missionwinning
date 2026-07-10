import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareStoryPage, COMPARE_STORIES, getCompareStory } from '@/page-components/CompareStoryPage';

export const dynamic = 'force-static';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPARE_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getCompareStory(slug);
  if (!story) return { title: 'Compare' };
  return { title: `${story.title} — Compare`, description: story.subtitle };
}

export default async function CompareStoryRoute({ params }: Props) {
  const { slug } = await params;
  const story = getCompareStory(slug);
  if (!story) notFound();
  return <CompareStoryPage story={story} />;
}
