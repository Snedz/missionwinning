import { TeacherClassPage } from '@/page-components/TeacherClassPage';

export default async function SchoolClassRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <TeacherClassPage code={code} />;
}
