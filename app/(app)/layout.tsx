import { AppLayout } from '@/components/layout/AppLayout';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout (under the (app) route group) adds the Sidebar + main shell
  // for all authenticated/tool pages: /log, /active, /library, /nutrition, etc.
  // Marketing pages (/, /programs, /coaching...) stay outside this group in root layout (no sidebar).
  return <AppLayout>{children}</AppLayout>;
}
