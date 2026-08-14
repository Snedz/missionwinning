import type { Metadata } from 'next';
import { LearnVsPublicPage } from '@/page-components/LearnVsPublicPage';
import { learnVsPageMetadata, requireLearnVsPage } from '@/lib/learnVsPages';

export const dynamic = 'force-static';

const ID = 'mission-winning-vs-hevy' as const;

export function generateMetadata(): Metadata {
  return learnVsPageMetadata(ID);
}

export default function MissionWinningVsHevyRoute() {
  return <LearnVsPublicPage page={requireLearnVsPage(ID)} />;
}
