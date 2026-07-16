import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

/** Route-scoped variable Inter for kinetic type (Barlow has no variable axis). */
const interVar = Inter({
  subsets: ['latin'],
  variable: '--font-xp-inter',
  display: 'swap',
});

export default function ExperienceLayout({ children }: { children: ReactNode }) {
  return <div className={interVar.variable}>{children}</div>;
}
