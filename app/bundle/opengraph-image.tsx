import { ImageResponse } from 'next/og';
import { OgBrandCard } from '@/lib/ogImageTemplate';

export const alt = 'Mission Winning Super Bundle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function BundleOgImage() {
  return new ImageResponse(
    (
      <OgBrandCard
        title="Super Bundle"
        subtitle="Six premium pillars · Free core forever · Founders pricing"
      />
    ),
    { ...size }
  );
}
