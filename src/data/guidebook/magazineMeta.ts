/**
 * Beyond the Basics — Mission Winning Magazine front matter.
 * Original MW copy only (see docs/guidebook-originality-log.md).
 */

export const MAGAZINE_PDF_PATH = '/magazine/beyond-the-basics.pdf';

/** Prefer localized PDF when present; callers may fall back to MAGAZINE_PDF_PATH. */
export function magazinePdfPathForLang(lang: string): string {
  const code = (lang || 'en').split('-')[0]?.toLowerCase() || 'en';
  if (code === 'en') return MAGAZINE_PDF_PATH;
  return `/magazine/beyond-the-basics.${code}.pdf`;
}

export const MAGAZINE_META = {
  title: 'Beyond the Basics',
  magazineLine: 'The Mission Winning Magazine',
  subtitle: 'Mission Winning to Read',
  version: '1.4.1',
  editionLabel: 'Compilation edition',
  siteOrigin: 'https://www.missionwinning.com',
  howToUse: [
    'Read a section when you want the why behind a lift, a macro target, or a deload.',
    'When you see a practice line, open that route in the app and do one small action — log a set, complete a screen, or try a flow.',
    'You can read start to finish, or jump to whatever you are stuck on. The app is the experience; this magazine is the reference.',
  ],
  preface: [
    'In the early days of serious training culture, the best programs came with something to read — not just a plan to follow. The combination mattered: experience the work, and understand what the body is doing while you do it.',
    'Mission Winning is built the same way. The app is where you train, fuel, move, recover, and track. This magazine is where you learn what adaptation is, how movement patterns work, how to tune volume and intensity, and how nutrition and sleep close the loop.',
    'Plenty of people discover strength, recovery, and coaching through tools like this — and some go on to coach others or work in the industry. We want that curiosity to have a clear, evidence-based home.',
    'Printed booklets are expensive to ship with every install. The web guide and this PDF keep the promise without the cost: free forever foundations, original Mission Winning wording, compiled from everything we have covered so far.',
    'A deeper revised edition — with more biomechanics, corrective depth, and current practice — will come later. For now, this is the collection: Beyond the Basics. Mission Winning to Read.',
  ],
  disclaimer: [
    'This magazine is educational fitness content for general audiences. It is not medical advice, diagnosis, or a substitute for care from a qualified clinician.',
    'Mission Winning is not affiliated with ISSA or any certifying body. Chapter topics are original Mission Winning wording inspired by common professional-education themes; no third-party textbook text is reproduced here.',
    'If you have health conditions, injuries, or answered yes on a readiness screen, get clearance before increasing intensity.',
  ],
} as const;

/** Absolute practice URL for PDF / print (strips query). */
export function magazinePracticeUrl(href: string): string {
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${MAGAZINE_META.siteOrigin}${path}`;
}
