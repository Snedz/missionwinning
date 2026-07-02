import { ImageResponse } from 'next/og';
import { marketingOgElement } from '@/lib/marketingOgImage';

export const alt = 'Mission Winning — Free Global Health App';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(marketingOgElement('landing'), { ...size });
}
