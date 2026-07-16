import { ImageResponse } from 'next/og';
import { OgBrandCard } from '@/lib/ogImageTemplate';
import { getCompareStory } from '@/data/compareStories';

export const alt = 'Mission Winning Compare';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function CompareStoryOgImage({ params }: Props) {
  const { slug } = await params;
  const story = getCompareStory(slug);
  return new ImageResponse(
    (
      <OgBrandCard
        title={story?.title || 'How we compare'}
        subtitle={story?.subtitle || 'Free tier vs the field'}
      />
    ),
    { ...size }
  );
}
