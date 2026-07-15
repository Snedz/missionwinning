import { AppLayout } from '@/components/layout/AppLayout';

/**
 * App shell layout. Client-only auth/journey — no force-dynamic so Next can
 * stream/static-shell where possible (Lighthouse / cold path).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
