import type { Metadata } from 'next';
import { LearnVsPublicPage } from '@/page-components/LearnVsPublicPage';
import { learnVsPageMetadata, requireLearnVsPage } from '@/lib/learnVsPages';

export const dynamic = 'force-static';

const ID = 'mission-winning-vs-fitbod' as const;

export function generateMetadata(): Metadata {
  return learnVsPageMetadata(ID);
}

export default function MissionWinningVsFitbodRoute() {
  return <LearnVsPublicPage page={requireLearnVsPage(ID)} />;
}
