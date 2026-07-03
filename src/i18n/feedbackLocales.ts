/** Feedback form strings — merged into i18n `common` namespace. */

const FEEDBACK_EN: Record<string, string> = {
  feedbackNameLabel: 'Full name (optional)',
  feedbackNamePlaceholder: 'Alex Rivera',
  feedbackEmailLabel: 'Email (for follow-up)',
  feedbackEmailPlaceholder: 'you@winning.com',
  feedbackResultsLabel: 'Key results so far',
  feedbackResultsPlaceholder: 'Added 25kg to squat in 6 weeks. Energy through the roof.',
  feedbackTestimonialLabel: 'Your testimonial',
  feedbackTestimonialPlaceholder: 'Stop waiting. The free tracker alone got me consistent...',
  feedbackRatingLabel: 'Rate your results (1–5)',
  feedbackActionLabel: 'Biggest action you took',
  feedbackActionPlaceholder: 'Finally ran the 5x5 program start to finish.',
  feedbackSubmit: 'Submit feedback',
  feedbackSubmitting: 'Submitting…',
  feedbackFootnote: 'Your words may be featured (anonymized or with permission).',
  feedbackThankBadge: 'Mission Builders',
  feedbackThankUnlock: '✓ Super Bundle premium unlocks',
  feedbackThankRoadmap: '✓ Input on roadmap + features',
  feedbackThankEarly: '✓ Early access to updates',
  feedbackThankEmail: 'Watch your email for updates + community drops.',
  feedbackBackToday: 'Back to Today',
  feedbackSignInDesc: 'Sign in to link feedback to your journey and sync across devices.',
};

const FEEDBACK_ES: Record<string, string> = {
  ...FEEDBACK_EN,
  feedbackNameLabel: 'Nombre completo (opcional)',
  feedbackEmailLabel: 'Correo (para seguimiento)',
  feedbackResultsLabel: 'Resultados clave hasta ahora',
  feedbackTestimonialLabel: 'Tu testimonio',
  feedbackRatingLabel: 'Califica tus resultados (1–5)',
  feedbackActionLabel: 'La acción más grande que tomaste',
  feedbackSubmit: 'Enviar comentarios',
  feedbackSubmitting: 'Enviando…',
  feedbackThankBadge: 'Constructores de la misión',
  feedbackThankUnlock: '✓ Desbloqueos premium del Super Bundle',
  feedbackThankRoadmap: '✓ Voz en la hoja de ruta y funciones',
  feedbackThankEarly: '✓ Acceso anticipado a actualizaciones',
  feedbackBackToday: 'Volver a Hoy',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: FEEDBACK_EN,
  es: FEEDBACK_ES,
};

export function feedbackStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeFeedbackStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, feedbackStringsFor(lang));
}
