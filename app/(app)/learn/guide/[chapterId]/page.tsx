import { GuidebookChapterPage } from '@/page-components/GuidebookChapterPage';

type Props = { params: Promise<{ chapterId: string }> };

export default async function GuidebookChapterRoute({ params }: Props) {
  const { chapterId } = await params;
  return <GuidebookChapterPage chapterId={chapterId} />;
}
