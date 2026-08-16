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

  /*
   * `.215` — the Profile card and its sheet. Separate keys from the `/feedback`
   * form above on purpose: that form collects testimonials and ratings, this one
   * asks a single friction question. Sharing strings between them would make one
   * instrument's copy drift into the other's.
   */
  feedbackCardTitle: 'Tell us what broke',
  feedbackCardLead:
    'A bug, a confusing screen, or something you wish it did. One box, no account, and it sends even if you write it with no signal.',
  feedbackCardOpen: 'Send feedback',
  feedbackSheetEyebrow: 'Beta',
  feedbackSheetTitle: 'What got in your way?',
  feedbackSheetPlaceholder: 'What broke, what confused you, or what you wish it did.',
  // `left`, not `count`: i18next treats `count` as a plural selector and would
  // look for `_one`/`_other` variants that do not exist, resolving to nothing.
  feedbackSheetRemaining: '{{left}} characters left',
  feedbackSheetEmailLabel: 'Email (optional)',
  feedbackSheetEmailHelp: 'Only so we can reply. Leave it blank and send anyway.',
  feedbackSheetContext:
    'Sent with your app version and where you have been ({{screens}}), so we can find it.',
  feedbackSheetSend: 'Send',
  feedbackSheetSentTitle: 'Got it',
  feedbackSheetSentBody: 'Queued. It sends when you have a connection — you can close the app.',
  feedbackSheetSentAnon: 'No email, so there is no way to reply — but it was read.',
  feedbackSheetDone: 'Close',
  /** Structured beta-feedback prompts on `/feedback`. */
  feedbackFrictionLabel: 'What confused you or broke? (required)',
  feedbackFrictionPlaceholder:
    'e.g. Rest timer was hard to find mid-set outdoors. Or: Coach week ignored my missed day.',
  feedbackExpectedLabel: 'What did you expect instead? (optional)',
  feedbackExpectedPlaceholder:
    'e.g. One big Skip button after the set, not three presets.',
  feedbackNextWantLabel: 'One thing to improve next (optional)',
  feedbackNextWantPlaceholder: 'e.g. Clearer set kind labels on phone.',
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

function fb(partial: Partial<Record<string, string>>): Record<string, string> {
  return { ...FEEDBACK_EN, ...(partial as Record<string, string>) };
}

const BY_LANG: Record<string, Record<string, string>> = {
  en: FEEDBACK_EN,
  es: FEEDBACK_ES,
  pt: fb({
    feedbackNameLabel: 'Nome completo (opcional)',
    feedbackEmailLabel: 'E-mail (para retorno)',
    feedbackResultsLabel: 'Principais resultados até agora',
    feedbackTestimonialLabel: 'Seu depoimento',
    feedbackRatingLabel: 'Avalie seus resultados (1–5)',
    feedbackActionLabel: 'Maior ação que você tomou',
    feedbackSubmit: 'Enviar feedback',
    feedbackSubmitting: 'Enviando…',
    feedbackBackToday: 'Voltar para Hoje',
  }),
  de: fb({
    feedbackNameLabel: 'Vollständiger Name (optional)',
    feedbackEmailLabel: 'E-Mail (für Rückfragen)',
    feedbackResultsLabel: 'Wichtige Ergebnisse bisher',
    feedbackTestimonialLabel: 'Dein Testimonial',
    feedbackRatingLabel: 'Ergebnisse bewerten (1–5)',
    feedbackActionLabel: 'Größte Aktion, die du unternommen hast',
    feedbackSubmit: 'Feedback senden',
    feedbackSubmitting: 'Senden…',
    feedbackBackToday: 'Zurück zu Heute',
  }),
  it: fb({
    feedbackSubmit: 'Invia feedback',
    feedbackBackToday: 'Torna a Oggi',
  }),
  ru: fb({
    feedbackSubmit: 'Отправить отзыв',
    feedbackBackToday: 'Назад к Сегодня',
  }),
  ja: fb({
    feedbackSubmit: 'フィードバックを送る',
    feedbackBackToday: '今日に戻る',
  }),
  ko: fb({
    feedbackSubmit: '피드백 제출',
    feedbackBackToday: '오늘로 돌아가기',
  }),
  zh: fb({
    feedbackSubmit: '提交反馈',
    feedbackBackToday: '返回今日',
  }),
  th: fb({
    feedbackSubmit: 'ส่งความคิดเห็น',
    feedbackBackToday: 'กลับไปวันนี้',
  }),
  vi: fb({
    feedbackSubmit: 'Gửi phản hồi',
    feedbackBackToday: 'Về Hôm nay',
  }),
  hi: fb({
    feedbackSubmit: 'प्रतिक्रिया भेजें',
    feedbackBackToday: 'आज पर वापस',
  }),
  id: fb({
    feedbackSubmit: 'Kirim umpan balik',
    feedbackBackToday: 'Kembali ke Hari Ini',
  }),
  ar: fb({
    feedbackSubmit: 'إرسال الملاحظات',
    feedbackBackToday: 'العودة إلى اليوم',
  }),
};

export function feedbackStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeFeedbackStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, feedbackStringsFor(lang));
}
