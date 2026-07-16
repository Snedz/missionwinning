import { ImageResponse } from 'next/og';
import { OgBrandCard } from '@/lib/ogImageTemplate';

export const alt = 'Mission Winning — The Mission Experience';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function ExperienceOgImage() {
  return new ImageResponse(
    (
      <OgBrandCard
        title="The Mission Experience"
        subtitle="Nothing is a video. Everything is code. Free core forever."
      />
    ),
    { ...size }
  );
}
