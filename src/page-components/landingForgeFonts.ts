import { Archivo, Bebas_Neue, JetBrains_Mono, Oswald } from 'next/font/google';

/** Forge landing faces. Self-hosted by next/font — no CDN at runtime. */
export const forgeDisplay = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-forge-display',
  display: 'swap',
});

export const forgeHeading = Oswald({
  subsets: ['latin'],
  variable: '--font-forge-heading',
  display: 'swap',
});

export const forgeBody = Archivo({
  subsets: ['latin'],
  variable: '--font-forge-body',
  display: 'swap',
});

export const forgeMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-forge-mono',
  display: 'swap',
});

export const forgeFontClass = [
  forgeDisplay.variable,
  forgeHeading.variable,
  forgeBody.variable,
  forgeMono.variable,
].join(' ');
