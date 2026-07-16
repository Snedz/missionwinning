import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { LearnPage } from '@/page-components/LearnPage';

export const metadata: Metadata = publicPageMetadata({
  title: "Learn",
  description: "Practical training education and specialist programs.",
  path: "/learn",
});

export default function LearnRoute() {
  return <LearnPage />;
}
