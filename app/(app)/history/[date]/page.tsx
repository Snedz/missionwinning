import { HistoryDayPage } from '@/page-components/HistoryDayPage';

/**
 * `.251` — replay one day. The date is user input straight off the URL, so
 * `buildDayRecord` validates its shape rather than trusting it.
 */
export default async function HistoryDayRoute({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <HistoryDayPage date={date} />;
}
