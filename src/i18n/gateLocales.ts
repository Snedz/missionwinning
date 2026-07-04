/** Private gate + offline fallback copy. */

const GATE_EN: Record<string, string> = {
  gateEyebrow: 'Private beta in progress',
  gateTitle1: 'Train anywhere.',
  gateTitle2: 'Win daily.',
  gateSubtitle:
    'The free health everything app — training, nutrition, mobility, mind, activity, and learning. Launching soon, free core forever.',
  gateWaitlistTitle: 'Get notified at launch',
  gateWaitlistPlaceholder: 'you@example.com',
  gateWaitlistSubmit: 'Notify me',
  gateWaitlistSubmitting: 'Joining…',
  gateWaitlistDone: "You're on the list.",
  gateWaitlistDoneFoot: "We'll email you the moment doors open.",
  gateWaitlistFoot: 'No spam — one email when the beta opens, one at launch.',
  gateAccessSummary: 'Have a beta access code?',
  gateAccessLabel: 'Access code',
  gateAccessPlaceholder: 'Enter code from your invite',
  gateAccessSubmit: 'Enter the beta',
  gateAccessChecking: 'Checking…',
  gateBetaGuide: 'beta start guide',
  gateBetaGuideFoot: 'Invited testers: see the',
  offlineEyebrow: 'No connection',
  offlineTitle: 'Offline — but not off mission.',
  offlineBody:
    "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
  offlineCta: 'Open Today',
};

const GATE_ES: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta privada en curso',
  gateTitle1: 'Entrena en cualquier lugar.',
  gateTitle2: 'Gana a diario.',
  gateWaitlistSubmit: 'Avísame',
  offlineTitle: 'Sin conexión — pero en misión.',
  offlineCta: 'Abrir Hoy',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: GATE_EN,
  es: GATE_ES,
};

export function gateStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeGateStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, gateStringsFor(lang));
}
