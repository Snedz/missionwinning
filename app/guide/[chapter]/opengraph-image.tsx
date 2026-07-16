import { ImageResponse } from 'next/og';
import { OgBrandCard } from '@/lib/ogImageTemplate';
import { getGuideChapter } from '@/lib/guidePublic';

export const alt = 'Mission Winning Guide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ chapter: string }> };

export default async function GuideChapterOgImage({ params }: Props) {
  const { chapter: id } = await params;
  const data = getGuideChapter(id);
  const title = data?.chapter.title || 'Foundations Guide';
  const subtitle = data?.chapter.subtitle || 'Free forever · No email wall';
  return new ImageResponse(<OgBrandCard title={title} subtitle={subtitle} />, {
    ...size,
  });
}
