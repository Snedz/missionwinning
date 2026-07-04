import { AppLayout } from '@/components/layout/AppLayout';

// Interactive app shell (auth, zustand, i18n) — scoped to authenticated routes.
export const dynamic = 'force-dynamic';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
