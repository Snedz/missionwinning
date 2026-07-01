import { JoinClassPage } from '@/page-components/JoinClassPage';

export default async function JoinClassRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <JoinClassPage code={code} />;
}
