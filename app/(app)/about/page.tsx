import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/seoMetadata';
import { AboutPage } from '@/page-components/AboutPage';

export const metadata: Metadata = publicPageMetadata({
  title: "About",
  description: "Mission Winning — free global health and workout app.",
  path: "/about",
});

export default function About() {
  return <AboutPage />;
}
