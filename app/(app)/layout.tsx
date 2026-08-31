import { PathShell } from '@/components/zero/PathShell';

/**
 * Signed-in product chrome. Client-only auth/journey — no force-dynamic so Next
 * can stream/static-shell where possible (Lighthouse / cold path).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PathShell>{children}</PathShell>;
}
