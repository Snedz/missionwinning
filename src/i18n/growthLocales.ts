/**
 * Growth / referral / share copy — Wave 8.
 * LLM-drafted partial locales — founder review before public flip.
 * Product nouns (Win Score, Super Bundle, I-Day, Mission Winning) stay English.
 */

type GrowthStrings = {
  growthReferralTitle: string;
  growthReferralDesc: string;
  growthReferralInvite: string;
  growthReferralCode: string;
  growthReferralCount: string;
  growthReferralSignIn: string;
  growthReferralSignInHint: string;
  growthRecognition3: string;
  growthRecognition10: string;
  growthRecognition25: string;
  growthShareCopied: string;
  growthShareFailed: string;
};

const en: GrowthStrings = {
  growthReferralTitle: 'Invite a friend',
  growthReferralDesc:
    'Share your code. When someone starts their free path with it, you both grow the mission. Recognition only — no paid rewards yet.',
  growthReferralInvite: 'Invite a friend',
  growthReferralCode: 'Your code',
  growthReferralCount: '{{count}} recruited',
  growthReferralSignIn: 'Sign in',
  growthReferralSignInHint: 'Sign in to get your invite code and share the mission.',
  growthRecognition3: 'Recruiter',
  growthRecognition10: 'Field Recruiter',
  growthRecognition25: 'Mission Recruiter',
  growthShareCopied: 'Link copied',
  growthShareFailed: 'Could not share',
};

const es: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Invita a un amigo',
  growthReferralDesc:
    'Comparte tu código. Cuando alguien empieza el camino gratis con él, crece la misión. Solo reconocimiento — sin recompensas de pago por ahora.',
  growthReferralInvite: 'Invitar a un amigo',
  growthReferralCode: 'Tu código',
  growthReferralCount: '{{count}} reclutados',
  growthReferralSignIn: 'Iniciar sesión',
  growthReferralSignInHint: 'Inicia sesión para obtener tu código e invitar a la misión.',
  growthRecognition3: 'Reclutador',
  growthRecognition10: 'Reclutador de campo',
  growthRecognition25: 'Reclutador de misión',
  growthShareCopied: 'Enlace copiado',
  growthShareFailed: 'No se pudo compartir',
};

const pt: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Convide um amigo',
  growthReferralDesc:
    'Compartilhe seu código. Quando alguém começa o caminho grátis com ele, a missão cresce. Só reconhecimento — sem recompensas pagas ainda.',
  growthReferralInvite: 'Convidar um amigo',
  growthReferralCode: 'Seu código',
  growthReferralCount: '{{count}} recrutados',
  growthReferralSignIn: 'Entrar',
  growthReferralSignInHint: 'Entre para obter seu código e compartilhar a missão.',
  growthRecognition3: 'Recrutador',
  growthRecognition10: 'Recrutador de campo',
  growthRecognition25: 'Recrutador da missão',
  growthShareCopied: 'Link copiado',
  growthShareFailed: 'Não foi possível compartilhar',
};

const de: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Freund einladen',
  growthReferralDesc:
    'Teile deinen Code. Wenn jemand den kostenlosen Weg damit startet, wächst die Mission. Nur Anerkennung — noch keine bezahlten Rewards.',
  growthReferralInvite: 'Freund einladen',
  growthReferralCode: 'Dein Code',
  growthReferralCount: '{{count}} geworben',
  growthReferralSignIn: 'Anmelden',
  growthReferralSignInHint: 'Melde dich an, um deinen Einladungscode zu erhalten.',
  growthRecognition3: 'Recruiter',
  growthRecognition10: 'Field Recruiter',
  growthRecognition25: 'Mission Recruiter',
  growthShareCopied: 'Link kopiert',
  growthShareFailed: 'Teilen fehlgeschlagen',
};

const fr: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Inviter un ami',
  growthReferralDesc:
    'Partagez votre code. Quand quelqu’un commence le parcours gratuit avec, la mission grandit. Reconnaissance seulement — pas de récompenses payantes pour l’instant.',
  growthReferralInvite: 'Inviter un ami',
  growthReferralCode: 'Votre code',
  growthReferralCount: '{{count}} recrutés',
  growthReferralSignIn: 'Se connecter',
  growthReferralSignInHint: 'Connectez-vous pour obtenir votre code d’invitation.',
  growthRecognition3: 'Recruteur',
  growthRecognition10: 'Recruteur de terrain',
  growthRecognition25: 'Recruteur de mission',
  growthShareCopied: 'Lien copié',
  growthShareFailed: 'Partage impossible',
};

// Batch C — full records (LLM-drafted)
const it: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Invita un amico',
  growthReferralDesc:
    'Condividi il tuo codice. Quando qualcuno inizia il percorso gratis con esso, la missione cresce. Solo riconoscimento — niente ricompense a pagamento per ora.',
  growthReferralInvite: 'Invita un amico',
  growthReferralCode: 'Il tuo codice',
  growthReferralCount: '{{count}} reclutati',
  growthReferralSignIn: 'Accedi',
  growthReferralSignInHint: 'Accedi per ottenere il codice invito e condividere la missione.',
  growthRecognition3: 'Reclutatore',
  growthRecognition10: 'Reclutatore sul campo',
  growthRecognition25: 'Reclutatore di missione',
  growthShareCopied: 'Link copiato',
  growthShareFailed: 'Condivisione non riuscita',
};

const ru: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Пригласить друга',
  growthReferralDesc:
    'Поделитесь кодом. Когда кто-то начнёт бесплатный путь с ним, миссия растёт. Только признание — без платных наград пока.',
  growthReferralInvite: 'Пригласить друга',
  growthReferralCode: 'Ваш код',
  growthReferralCount: '{{count}} приглашено',
  growthReferralSignIn: 'Войти',
  growthReferralSignInHint: 'Войдите, чтобы получить код приглашения.',
  growthRecognition3: 'Рекрутер',
  growthRecognition10: 'Полевой рекрутер',
  growthRecognition25: 'Рекрутер миссии',
  growthShareCopied: 'Ссылка скопирована',
  growthShareFailed: 'Не удалось поделиться',
};

const ko: GrowthStrings = {
  ...en,
  growthReferralTitle: '친구 초대',
  growthReferralDesc:
    '코드를 공유하세요. 누군가 이 코드로 무료 경로를 시작하면 미션이 커집니다. 인정만 — 아직 유료 보상 없음.',
  growthReferralInvite: '친구 초대',
  growthReferralCode: '내 코드',
  growthReferralCount: '{{count}}명 모집',
  growthReferralSignIn: '로그인',
  growthReferralSignInHint: '로그인하면 초대 코드를 받아 미션을 공유할 수 있습니다.',
  growthRecognition3: '리크루터',
  growthRecognition10: '필드 리크루터',
  growthRecognition25: '미션 리크루터',
  growthShareCopied: '링크 복사됨',
  growthShareFailed: '공유 실패',
};

const ja: GrowthStrings = {
  ...en,
  growthReferralTitle: '友達を招待',
  growthReferralDesc:
    'コードを共有。誰かがそれで無料パスを始めるとミッションが広がります。認識のみ — 有料リワードはまだありません。',
  growthReferralInvite: '友達を招待',
  growthReferralCode: 'あなたのコード',
  growthReferralCount: '{{count}}人を招待',
  growthReferralSignIn: 'サインイン',
  growthReferralSignInHint: 'サインインすると招待コードを取得して共有できます。',
  growthRecognition3: 'リクルーター',
  growthRecognition10: 'フィールド・リクルーター',
  growthRecognition25: 'ミッション・リクルーター',
  growthShareCopied: 'リンクをコピーしました',
  growthShareFailed: '共有できませんでした',
};

/** Batch D — LLM-drafted; founder review before public flip. */
const hi: GrowthStrings = {
  ...en,
  growthReferralTitle: 'मित्र को आमंत्रित करें',
  growthReferralInvite: 'मित्र को आमंत्रित करें',
  growthReferralCode: 'आपका कोड',
  growthReferralCount: '{{count}} आमंत्रित',
  growthReferralSignIn: 'साइन इन',
  growthShareCopied: 'लिंक कॉपी हुआ',
};

const id: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Undang teman',
  growthReferralInvite: 'Undang teman',
  growthReferralCode: 'Kode Anda',
  growthReferralCount: '{{count}} direkrut',
  growthReferralSignIn: 'Masuk',
  growthShareCopied: 'Tautan disalin',
};

const th: GrowthStrings = {
  ...en,
  growthReferralTitle: 'เชิญเพื่อน',
  growthReferralInvite: 'เชิญเพื่อน',
  growthReferralCode: 'รหัสของคุณ',
  growthReferralCount: 'เชิญแล้ว {{count}}',
  growthReferralSignIn: 'เข้าสู่ระบบ',
  growthShareCopied: 'คัดลอกลิงก์แล้ว',
};

const zh: GrowthStrings = {
  ...en,
  growthReferralTitle: '邀请好友',
  growthReferralInvite: '邀请好友',
  growthReferralCode: '你的代码',
  growthReferralCount: '已邀请 {{count}} 人',
  growthReferralSignIn: '登录',
  growthShareCopied: '链接已复制',
};

const vi: GrowthStrings = {
  ...en,
  growthReferralTitle: 'Mời bạn',
  growthReferralInvite: 'Mời bạn',
  growthReferralCode: 'Mã của bạn',
  growthReferralCount: '{{count}} đã mời',
  growthReferralSignIn: 'Đăng nhập',
  growthShareCopied: 'Đã sao chép liên kết',
};

const ar: GrowthStrings = {
  ...en,
  growthReferralTitle: 'ادعُ صديقًا',
  growthReferralInvite: 'ادعُ صديقًا',
  growthReferralCode: 'رمزك',
  growthReferralCount: '{{count}} تمت دعوتهم',
  growthReferralSignIn: 'تسجيل الدخول',
  growthShareCopied: 'تم نسخ الرابط',
};

const BY_LANG: Record<string, GrowthStrings> = {
  en,
  es,
  pt,
  de,
  fr,
  it,
  ru,
  ko,
  ja,
  hi,
  id,
  th,
  zh,
  vi,
  ar,
};

export function growthStringsFor(lang: string): Record<string, string> {
  const base = BY_LANG[lang.split('-')[0]] ?? en;
  return { ...base } as unknown as Record<string, string>;
}

export function mergeGrowthStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, growthStringsFor(lang));
}
