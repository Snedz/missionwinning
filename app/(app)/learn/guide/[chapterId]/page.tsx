import { GuidebookChapterPage } from '@/page-components/GuidebookChapterPage';

type Props = { params: Promise<{ chapterId: string }> };

/**
 * Guide chapter first paint is house leftover. `dynamic()` + `RouteLoading`
 * made the served HTML a skeleton. Do not restyle chapter internals.
 * Course stays parked.
 */
export default async function GuidebookChapterRoute({ params }: Props) {
  const { chapterId } = await params;
  return <GuidebookChapterPage chapterId={chapterId} />;
}
