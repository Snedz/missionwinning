/** Tier 1 Welcome / Fuel / Active body copy (Phase I4). */

type WelcomePack = Record<string, string>;
type FuelPack = Record<string, string>;
type ActivePack = Record<string, string>;

const welcomeFr: WelcomePack = {
  welcomeKicker: 'Là où commence le parcours',
  welcomeIDay: 'Jour I',
  welcomeMissionLead: 'La mission :',
  welcomeMissionBody1:
    'Mission Winning est une app santé mondiale gratuite. Entraîne, nutrition, mouvement, esprit, suivi et apprentissage — un seul chemin.',
  welcomeMissionP2:
    'Les fondamentaux restent gratuits. Premium approfondit chaque pilier — jamais requis pour commencer.',
  welcomeMissionP3:
    'Aujourd’hui : une étape à la fois. Today affiche toujours ta prochaine action.',
  welcomeProfileTitle: 'Trois questions rapides',
  welcomeProfileEditHint: 'Mets à jour expérience, équipement et objectif. Sync si connecté.',
  welcomeProfileHint: 'Pour que Today recommande le bon point de départ.',
  welcomeExperience: 'Expérience',
  welcomeExpBeginner: 'Nouveau en entraînement',
  welcomeExpIntermediate: 'Un peu d’expérience',
  welcomeExpAdvanced: 'Entraîne depuis des années',
  welcomeGearCheck: 'Équipement — qu’as-tu aujourd’hui ?',
  welcomeEquipBodyweight: 'Poids du corps seulement',
  welcomeEquipDumbbells: 'Haltères ou bandes',
  welcomeEquipFullGym: 'Salle complète',
  welcomePrimaryGoal: 'Objectif principal',
  welcomeGoalPlaceholder: 'Gagner en force et rester en forme',
  goalPresetStrength: 'Force et santé',
  goalPresetFatLoss: 'Perdre du gras, garder le muscle',
  goalPresetEndurance: 'Endurance et stamina',
  goalPresetMobility: 'Mieux bouger — mobilité et récup',
  goalPresetGeneral: 'Rester en forme et régulier',
  goalPresetPft: 'Préparer le Presidential Fitness Test',
  goalPresetKids: 'Faire bouger mes enfants chaque jour',
  goalPresetAmericaHealth: 'Make America Healthy Again — commencer par moi',
  welcomeGoalPresetsLabel: 'Raccourcis (ou écris le tien ci-dessous)',
  welcomeBack: 'Retour',
  headerSignIn: 'Connexion',
  photoLogTitle: 'Logger depuis une photo',
  photoLogDesc: 'Photo du repas — estimation des macros (bêta bientôt).',
  photoLogChoose: 'Choisir une photo',
  photoLogComingSoon: 'Log photo en développement. Utilise log rapide ou recettes.',
  photoLogBetaNote: 'Capture repas — confidentialité d’abord, sur l’appareil si possible.',
  navOurMission: 'Notre mission',
  navBetaGuide: 'Guide bêta',
};

const welcomeDe: WelcomePack = {
  welcomeKicker: 'Hier beginnt die Reise',
  welcomeIDay: 'I-Tag',
  welcomeMissionLead: 'Die Mission:',
  welcomeMissionBody1:
    'Mission Winning ist eine kostenlose globale Gesundheits-App. Trainieren, Ernährung, Bewegung, Geist, Tracking und Lernen — ein Weg.',
  welcomeMissionP2:
    'Grundlagen bleiben kostenlos. Premium vertieft jede Säule — nie nötig zum Start.',
  welcomeMissionP3:
    'Heute: Schritt für Schritt. Today zeigt immer deine nächste Aktion.',
  welcomeProfileTitle: 'Drei kurze Fragen',
  welcomeProfileEditHint: 'Erfahrung, Equipment und Ziel aktualisieren. Sync bei Anmeldung.',
  welcomeProfileHint: 'Damit Today den richtigen Start empfiehlt.',
  welcomeExperience: 'Erfahrung',
  welcomeExpBeginner: 'Neu im Training',
  welcomeExpIntermediate: 'Etwas Erfahrung',
  welcomeExpAdvanced: 'Jahrelang trainiert',
  welcomeGearCheck: 'Equipment — was hast du heute?',
  welcomeEquipBodyweight: 'Nur Körpergewicht',
  welcomeEquipDumbbells: 'Hanteln oder Bänder',
  welcomeEquipFullGym: 'Volles Gym',
  welcomePrimaryGoal: 'Hauptziel',
  welcomeGoalPlaceholder: 'Kraft aufbauen und gesund bleiben',
  goalPresetStrength: 'Kraft und Gesundheit',
  goalPresetFatLoss: 'Fett verlieren, Muskeln halten',
  goalPresetEndurance: 'Ausdauer verbessern',
  goalPresetMobility: 'Besser bewegen — Mobilität & Erholung',
  goalPresetGeneral: 'Gesund und konstant bleiben',
  goalPresetPft: 'Presidential Fitness Test vorbereiten',
  goalPresetKids: 'Meine Kinder täglich bewegen',
  goalPresetAmericaHealth: 'Make America Healthy Again — bei mir starten',
  welcomeGoalPresetsLabel: 'Schnellauswahl (oder eigenes Ziel unten)',
  welcomeBack: 'Zurück',
  headerSignIn: 'Anmelden',
  photoLogTitle: 'Per Foto loggen',
  photoLogDesc: 'Mahlzeit fotografieren — Makros schätzen (Beta demnächst).',
  photoLogChoose: 'Foto wählen',
  photoLogComingSoon: 'Foto-Log in Entwicklung. Nutze Schnell-Log oder Rezepte.',
  photoLogBetaNote: 'Mahlzeit-Erfassung — Datenschutz zuerst, on-device wenn möglich.',
  navOurMission: 'Unsere Mission',
  navBetaGuide: 'Beta-Leitfaden',
};

const welcomePt: WelcomePack = {
  welcomeKicker: 'Onde a jornada começa',
  welcomeIDay: 'Dia I',
  welcomeMissionLead: 'A missão:',
  welcomeMissionBody1:
    'Mission Winning é um app de saúde global gratuito. Treine, nutrição, movimento, mente, registro e aprendizado — um caminho.',
  welcomeMissionP2:
    'O básico é grátis para sempre. Premium aprofunda cada pilar — nunca obrigatório para começar.',
  welcomeMissionP3:
    'Hoje: um passo de cada vez. Today sempre mostra sua próxima ação.',
  welcomeProfileTitle: 'Três perguntas rápidas',
  welcomeProfileEditHint: 'Atualize experiência, equipamento e meta. Sincroniza ao entrar.',
  welcomeProfileHint: 'Para Today recomendar o ponto de partida certo.',
  welcomeExperience: 'Experiência',
  welcomeExpBeginner: 'Novo no treino',
  welcomeExpIntermediate: 'Alguma experiência',
  welcomeExpAdvanced: 'Treina há anos',
  welcomeGearCheck: 'Equipamento — o que você tem hoje?',
  welcomeEquipBodyweight: 'Só peso corporal',
  welcomeEquipDumbbells: 'Halteres ou elásticos',
  welcomeEquipFullGym: 'Academia completa',
  welcomePrimaryGoal: 'Meta principal',
  welcomeGoalPlaceholder: 'Ganhar força e ficar saudável',
  goalPresetStrength: 'Força e saúde',
  goalPresetFatLoss: 'Perder gordura, manter músculo',
  goalPresetEndurance: 'Melhorar resistência',
  goalPresetMobility: 'Mover melhor — mobilidade e recuperação',
  goalPresetGeneral: 'Ficar saudável e consistente',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'Atalhos (ou digite abaixo)',
  welcomeBack: 'Voltar',
  headerSignIn: 'Entrar',
  photoLogTitle: 'Registrar por foto',
  photoLogDesc: 'Foto da refeição — estimamos macros (beta em breve).',
  photoLogChoose: 'Escolher foto',
  photoLogComingSoon: 'Log por foto em desenvolvimento. Use log rápido ou receitas.',
  photoLogBetaNote: 'Privacidade primeiro — no dispositivo quando possível.',
  navOurMission: 'Nossa missão',
  navBetaGuide: 'Guia beta',
};

const welcomeIt: WelcomePack = { ...welcomeFr,
  welcomeKicker: 'Dove inizia il percorso',
  welcomeIDay: 'Giorno I',
  welcomeMissionLead: 'La missione:',
  welcomeMissionBody1:
    'Mission Winning è un’app salute globale gratuita. Allenati, nutrizione, movimento, mente, tracking e apprendimento — un percorso.',
  welcomeProfileTitle: 'Tre domande rapide',
  welcomeBack: 'Indietro',
  headerSignIn: 'Accedi',
  navOurMission: 'La nostra missione',
};

const welcomeKo: WelcomePack = { ...welcomeDe,
  welcomeKicker: '여정이 시작되는 곳',
  welcomeIDay: 'I-Day',
  welcomeMissionLead: '미션:',
  welcomeMissionBody1:
    'Mission Winning은 무료 글로벌 건강 앱입니다. 운동, 영양, 움직임, 마음, 기록, 학습 — 하나의 길.',
  welcomeProfileTitle: '세 가지 질문',
  welcomeBack: '뒤로',
  headerSignIn: '로그인',
  navOurMission: '우리의 미션',
};

const welcomeJa: WelcomePack = {
  welcomeKicker: '旅の始まり',
  welcomeIDay: 'I-Day',
  welcomeMissionLead: 'ミッション：',
  welcomeMissionBody1:
    'Mission Winningは無料のグローバル健康アプリ。トレーニング、栄養、ムーブ、マインド、記録、ラーン — 一つの道。',
  welcomeMissionP2: '基本機能は永久無料。Premiumは各ピラーを深めます — 開始に不要。',
  welcomeMissionP3: '今日の仕事：一歩ずつ。Todayは常に次のアクションを表示します。',
  welcomeProfileTitle: '3つの質問',
  welcomeProfileEditHint: '経験・器具・目標を更新。サインインで同期。',
  welcomeProfileHint: 'Todayが最適な起点を提案するため。',
  welcomeExperience: '経験',
  welcomeExpBeginner: 'トレーニング初心者',
  welcomeExpIntermediate: '経験あり',
  welcomeExpAdvanced: '長年トレーニング',
  welcomeGearCheck: '器具 — 今日使えるものは？',
  welcomeEquipBodyweight: '自重のみ',
  welcomeEquipDumbbells: 'ダンベルまたはバンド',
  welcomeEquipFullGym: 'フルジム',
  welcomePrimaryGoal: '主な目標',
  welcomeGoalPlaceholder: '筋力をつけ健康を保つ',
  goalPresetStrength: '筋力と健康',
  goalPresetFatLoss: '脂肪を落とし筋肉を維持',
  goalPresetEndurance: '持久力を高める',
  goalPresetMobility: '動きを改善 — モビリティと回復',
  goalPresetGeneral: '健康で継続する',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'クイック選択（または下に入力）',
  welcomeBack: '戻る',
  headerSignIn: 'サインイン',
  photoLogTitle: '写真から記録',
  photoLogDesc: '食事を撮影 — マクロ推定（ベータ近日）',
  photoLogChoose: '写真を選ぶ',
  photoLogComingSoon: '写真ログ開発中。クイックログまたはレシピをご利用ください。',
  photoLogBetaNote: 'プライバシー優先 — 可能なら端末上で処理。',
  navOurMission: '私たちのミッション',
  navBetaGuide: 'ベータガイド',
};

const welcomeRu: WelcomePack = { ...welcomeDe,
  welcomeKicker: 'Здесь начинается путь',
  welcomeIDay: 'День I',
  welcomeMissionLead: 'Миссия:',
  welcomeMissionBody1:
    'Mission Winning — бесплатное глобальное приложение для здоровья. Тренировки, питание, движение, разум, трекинг и обучение.',
  welcomeProfileTitle: 'Три быстрых вопроса',
  welcomeBack: 'Назад',
  headerSignIn: 'Войти',
  navOurMission: 'Наша миссия',
};

export const TIER1_WELCOME: Record<string, WelcomePack> = {
  fr: welcomeFr,
  de: welcomeDe,
  pt: welcomePt,
  it: welcomeIt,
  ko: welcomeKo,
  ja: welcomeJa,
  ru: welcomeRu,
};

const fuelEsStyle = {
  fuelPremiumActive: ' Premium: biblioteca completa + planes (Super Bundle).',
  fuelWinScore: 'Puntuación de Misión',
  fuelTargetsTitle: 'Objetivos de hoy',
  fuelCalories: 'Calorías',
  fuelProtein: 'Proteína',
  fuelHydrationTitle: 'Hidratación',
  fuelGlasses: 'vasos',
  fuelQuickLogTitle: 'Registro rápido',
  fuelLogBtn: 'Registrar',
  fuelTodayLogTitle: 'Registro de hoy',
  fuelExploreBundle: 'Explorar Super Bundle',
  fuelLogFab: 'Registrar comida',
  fuelLogSheetTitle: 'Registrar en Fuel',
  fuelTabQuick: 'Rápido',
  fuelTabCustom: 'Personalizado',
  fuelTabPhoto: 'Foto',
};

const fuelFr: FuelPack = {
  ...fuelEsStyle,
  fuelWinScore: 'Score Mission',
  fuelTargetsTitle: 'Objectifs du jour',
  fuelCalories: 'Calories',
  fuelProtein: 'Protéines',
  fuelHydrationTitle: 'Hydratation',
  fuelGlasses: 'verres',
  fuelQuickLogTitle: 'Log rapide',
  fuelLogBtn: 'Enregistrer',
  fuelTodayLogTitle: "Journal d'aujourd'hui",
  fuelExploreBundle: 'Découvrir Super Bundle',
  fuelLogFab: 'Logger repas',
  fuelLogSheetTitle: 'Logger dans Fuel',
};

const fuelDe: FuelPack = {
  ...fuelEsStyle,
  fuelWinScore: 'Missions-Score',
  fuelTargetsTitle: 'Heutige Ziele',
  fuelCalories: 'Kalorien',
  fuelProtein: 'Protein',
  fuelHydrationTitle: 'Hydration',
  fuelGlasses: 'Gläser',
  fuelQuickLogTitle: 'Schnell-Log',
  fuelLogBtn: 'Loggen',
  fuelTodayLogTitle: 'Heutiges Log',
  fuelExploreBundle: 'Super Bundle entdecken',
  fuelLogFab: 'Essen loggen',
  fuelLogSheetTitle: 'In Fuel loggen',
};

const fuelPt: FuelPack = {
  ...fuelEsStyle,
  fuelWinScore: 'Pontuação da Missão',
  fuelTargetsTitle: 'Metas de hoje',
  fuelCalories: 'Calorias',
  fuelProtein: 'Proteína',
  fuelHydrationTitle: 'Hidratação',
  fuelLogBtn: 'Registrar',
  fuelTodayLogTitle: 'Registro de hoje',
};

const fuelIt: FuelPack = { ...fuelFr, fuelWinScore: 'Punteggio Missione', fuelTargetsTitle: 'Obiettivi di oggi' };
const fuelKo: FuelPack = { ...fuelDe, fuelWinScore: '미션 점수', fuelTargetsTitle: '오늘의 목표' };
const fuelJa: FuelPack = {
  ...fuelEsStyle,
  fuelWinScore: 'ミッションスコア',
  fuelTargetsTitle: '今日の目標',
  fuelCalories: 'カロリー',
  fuelProtein: 'タンパク質',
  fuelHydrationTitle: '水分',
  fuelLogBtn: '記録',
  fuelTodayLogTitle: '今日のログ',
  fuelExploreBundle: 'Super Bundleを見る',
};
const fuelRu: FuelPack = { ...fuelDe, fuelWinScore: 'Счёт миссии', fuelTargetsTitle: 'Цели на сегодня' };

export const TIER1_FUEL: Record<string, FuelPack> = {
  fr: fuelFr,
  de: fuelDe,
  pt: fuelPt,
  it: fuelIt,
  ko: fuelKo,
  ja: fuelJa,
  ru: fuelRu,
};

const activeBase = {
  activeNoWorkout: 'No Active Workout',
  activeStartWorkout: 'Start Workout',
  activeSetsCompleted: '{{done}}/{{total}} sets completed',
  activeCancel: 'Cancel',
  activeFinish: 'Finish',
  activeRestTitle: 'Rest',
  activeRestSkip: 'Skip',
  activeLogSet: 'Log',
  activeRepeatLast: 'Repeat last set',
  activeSetLogged: 'Set logged!',
  activeFormGuide: 'Form guide',
};

const activeFr: ActivePack = {
  ...activeBase,
  activeNoWorkout: 'Pas d’entraînement actif',
  activeStartWorkout: 'Commencer',
  activeSetsCompleted: '{{done}}/{{total}} séries terminées',
  activeCancel: 'Annuler',
  activeFinish: 'Terminer',
  activeRestTitle: 'Repos',
  activeRestSkip: 'Passer',
  activeLogSet: 'Enregistrer',
  activeRepeatLast: 'Répéter la dernière série',
  activeSetLogged: 'Série enregistrée !',
  activeFormGuide: 'Guide technique',
};

const activeDe: ActivePack = {
  ...activeBase,
  activeNoWorkout: 'Kein aktives Training',
  activeStartWorkout: 'Training starten',
  activeSetsCompleted: '{{done}}/{{total}} Sätze erledigt',
  activeCancel: 'Abbrechen',
  activeFinish: 'Beenden',
  activeRestTitle: 'Pause',
  activeRestSkip: 'Überspringen',
  activeLogSet: 'Loggen',
  activeRepeatLast: 'Letzten Satz wiederholen',
  activeSetLogged: 'Satz geloggt!',
};

const activePt: ActivePack = {
  ...activeBase,
  activeNoWorkout: 'Sem treino ativo',
  activeStartWorkout: 'Iniciar treino',
  activeRestTitle: 'Descanso',
  activeLogSet: 'Registrar',
  activeRepeatLast: 'Repetir última série',
};

const activeIt: ActivePack = { ...activeFr, activeStartWorkout: 'Inizia allenamento' };
const activeKo: ActivePack = { ...activeDe, activeStartWorkout: '운동 시작', activeRestTitle: '휴식', activeLogSet: '기록' };
const activeJa: ActivePack = {
  ...activeBase,
  activeNoWorkout: 'アクティブなワークアウトなし',
  activeStartWorkout: 'ワークアウト開始',
  activeRestTitle: '休息',
  activeLogSet: '記録',
  activeRepeatLast: '前セットを繰り返す',
  activeSetLogged: 'セット記録完了！',
};
const activeRu: ActivePack = { ...activeDe, activeStartWorkout: 'Начать тренировку', activeRestTitle: 'Отдых', activeLogSet: 'Записать' };

export const TIER1_ACTIVE: Record<string, ActivePack> = {
  fr: activeFr,
  de: activeDe,
  pt: activePt,
  it: activeIt,
  ko: activeKo,
  ja: activeJa,
  ru: activeRu,
};

export function tier1WelcomeBody(lang: string): WelcomePack | undefined {
  return TIER1_WELCOME[lang.split('-')[0]];
}

export function tier1FuelBody(lang: string): FuelPack | undefined {
  return TIER1_FUEL[lang.split('-')[0]];
}

export function tier1ActiveBody(lang: string): ActivePack | undefined {
  return TIER1_ACTIVE[lang.split('-')[0]];
}
