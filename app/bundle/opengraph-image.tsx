import { ImageResponse } from 'next/og';
import { marketingOgElement } from '@/lib/marketingOgImage';

export const alt = 'Mission Winning Super Bundle Pricing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function BundleOpenGraphImage() {
  return new ImageResponse(marketingOgElement('bundle'), { ...size });
}
