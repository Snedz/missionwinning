import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { VisionPage } from '@/page-components/VisionPage';

export const metadata: Metadata = publicPageMetadata({
  title: "Vision",
  description: "The guiding vision for the free global everything app for health.",
  path: "/vision",
});

export default function Vision() {
  return <VisionPage />;
}
