/**
 * Contrast of the Design Polish pairs. The house skin uses these colours;
 * this is the check that they still clear WCAG AA for body text (4.5:1).
 */

export type ContrastPair = {
  name: string;
  fg: string;
  bg: string;
};

/** The pairs that carry text. Yellow is a fill behind near-black ink, never body text. */
export const POLISH_CONTRAST_PAIRS: ContrastPair[] = [
  { name: 'ink on ground', fg: '#e6ebef', bg: '#0a0c0f' },
  { name: 'ink on card', fg: '#e6ebef', bg: '#0f1319' },
  { name: 'ink on field', fg: '#e6ebef', bg: '#12161b' },
  { name: 'muted on ground', fg: '#7d8a95', bg: '#0a0c0f' },
  { name: 'muted on card', fg: '#7d8a95', bg: '#0f1319' },
  { name: 'muted on field', fg: '#7d8a95', bg: '#12161b' },
  { name: 'ink on signal', fg: '#0a0c0f', bg: '#ffb000' },
  { name: 'ink on signal-deep', fg: '#0a0c0f', bg: '#c98a00' },
];

function channel(hex: string, shift: number): number {
  const n = parseInt(hex.slice(1), 16);
  const c = ((n >> shift) & 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 16) + 0.7152 * channel(hex, 8) + 0.0722 * channel(hex, 0);
}

/** WCAG 2 contrast ratio. Order of the colours does not matter. */
export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}
