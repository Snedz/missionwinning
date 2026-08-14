/**
 * In-app Help FAQ. English floors from docs/help/faq.md.
 * School / PFT answers stay out — that track is parked.
 */
export type HelpFaqItem = { q: string; a: string };

export const HELP_FAQ: HelpFaqItem[] = [
  {
    q: 'Is Mission Winning really free?',
    a: 'Yes — the logger, library, history, and basic nutrition are free worldwide, forever, with no account and no card. Super Bundle is optional depth. The logger is never gated.',
  },
  {
    q: 'Do I need an account?',
    a: 'No for basic logging. Sign in to sync across devices. Offline logging never requires an account.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes as a PWA — log workouts offline; sync when back online if signed in.',
  },
  {
    q: 'Do I need a wearable?',
    a: 'No. Mission Coach reads the week from your logs. No wearable required.',
  },
  {
    q: 'Is Coach medical advice?',
    a: 'No — general fitness guidance only. Consult a professional for injuries or conditions.',
  },
  {
    q: 'How accurate is photo estimate?',
    a: 'Rough heuristic for convenience — not for clinical or competition prep. Edit the draft before you log a low-confidence meal.',
  },
  {
    q: 'How do I delete my data?',
    a: 'Export from Account first if needed, then use the in-app delete request or clear site data locally.',
  },
];
