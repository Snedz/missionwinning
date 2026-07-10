import { LearnPathsPublicIndexPage } from '@/page-components/LearnPathsPublicIndexPage';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Free learning paths — Mission Winning',
  description:
    'Ten free fitness learning paths: strength, nutrition, mobility, sleep, and more. No paywall on the basics.',
};

export default function PathsIndexRoute() {
  return <LearnPathsPublicIndexPage />;
}
