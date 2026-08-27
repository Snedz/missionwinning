import { HouseShell } from '@/components/house/HouseShell';

/**
 * Signed-in product house. Client-only auth/journey — no force-dynamic so Next
 * can stream/static-shell where possible (Lighthouse / cold path).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HouseShell>{children}</HouseShell>;
}
