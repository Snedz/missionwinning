import dynamic from 'next/dynamic';
import { RouteLoading } from '@/components/layout/RouteLoading';

const GuidebookChapterPage = dynamic(
  () => import('@/page-components/GuidebookChapterPage').then((m) => m.GuidebookChapterPage),
  { loading: () => <RouteLoading label="Guide" /> }
);

type Props = { params: Promise<{ chapterId: string }> };

export default async function GuidebookChapterRoute({ params }: Props) {
  const { chapterId } = await params;
  return <GuidebookChapterPage chapterId={chapterId} />;
}
