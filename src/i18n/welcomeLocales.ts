/** Welcome / I-Day onboarding copy — merged into i18n `common` namespace. */

export type WelcomeLang = string;

type WelcomeStrings = {
  welcomeKicker: string;
  welcomeIDay: string;
  welcomeMissionLead: string;
  welcomeMissionBody1: string;
  welcomeMissionP2: string;
  welcomeMissionP3: string;
  welcomeProfileTitle: string;
  welcomeProfileEditHint: string;
  welcomeProfileHint: string;
  welcomeExperience: string;
  welcomeExpBeginner: string;
  welcomeExpIntermediate: string;
  welcomeExpAdvanced: string;
  welcomeGearCheck: string;
  welcomeEquipBodyweight: string;
  welcomeEquipDumbbells: string;
  welcomeEquipFullGym: string;
  welcomePrimaryGoal: string;
  welcomeGoalPlaceholder: string;
  goalPresetStrength: string;
  goalPresetFatLoss: string;
  goalPresetEndurance: string;
  goalPresetMobility: string;
  goalPresetGeneral: string;
  goalPresetPft: string;
  goalPresetKids: string;
  goalPresetAmericaHealth: string;
  welcomeGoalPresetsLabel: string;
  welcomeBack: string;
  headerSignIn: string;
  photoLogTitle: string;
  photoLogDesc: string;
  photoLogChoose: string;
  photoLogComingSoon: string;
  photoLogBetaNote: string;
  navOurMission: string;
  navBetaGuide: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeBegin: string;
  welcomeAccept: string;
  welcomeContinue: string;
  welcomeSignInTitle: string;
  welcomeSignInSubtitle: string;
  welcomeSkipSignIn: string;
  welcomeRemindersOptIn: string;
  editJourneyProfile: string;
  saveProfile: string;
};

const en: WelcomeStrings = {
  welcomeKicker: 'Where the journey begins',
  welcomeIDay: 'I-Day',
  welcomeMissionLead: 'The mission:',
  welcomeMissionBody1:
    'Mission Winning is a free global health app. Train, fuel, move, mind, track, and learn — one place, one path forward.',
  welcomeMissionP2:
    'The fundamentals are free forever. Premium deepens each pillar for those who want more — never required to start.',
  welcomeMissionP3:
    'Your job today: complete one step at a time. Today hub will always show your next single action.',
  welcomeProfileTitle: 'Three quick questions',
  welcomeProfileEditHint: 'Update experience, equipment, and goal. Changes sync when signed in.',
  welcomeProfileHint: 'So Today can recommend the right starting point.',
  welcomeExperience: 'Experience',
  welcomeExpBeginner: 'New to training',
  welcomeExpIntermediate: 'Some experience',
  welcomeExpAdvanced: 'Training for years',
  welcomeGearCheck: 'Gear check — what do you have today?',
  welcomeEquipBodyweight: 'Bodyweight only',
  welcomeEquipDumbbells: 'Dumbbells or bands',
  welcomeEquipFullGym: 'Full gym access',
  welcomePrimaryGoal: 'Primary goal',
  welcomeGoalPlaceholder: 'Build strength and stay healthy',
  goalPresetStrength: 'Build strength and stay healthy',
  goalPresetFatLoss: 'Lose fat and keep muscle',
  goalPresetEndurance: 'Improve endurance and stamina',
  goalPresetMobility: 'Move better — mobility and recovery',
  goalPresetGeneral: 'Stay healthy and consistent',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'Quick picks (or type your own below)',
  welcomeBack: 'Back',
  headerSignIn: 'Sign in',
  photoLogTitle: 'Log from photo',
  photoLogDesc: 'Snap a meal — we estimate macros (beta coming soon).',
  photoLogChoose: 'Choose photo',
  photoLogComingSoon: 'Photo logging is in development. Use quick log or recipes for now.',
  photoLogBetaNote: 'Bevel-style meal capture — privacy-first, on-device when possible.',
  navOurMission: 'Our mission',
  navBetaGuide: 'Beta guide',
  welcomeTitle: 'Welcome, Mission Member',
  welcomeSubtitle:
    'Start your path toward lifelong health — one step at a time. About two minutes.',
  welcomeBegin: 'Begin',
  welcomeAccept: 'I accept the path',
  welcomeContinue: 'Continue',
  welcomeSignInTitle: 'Save progress — your choice',
  welcomeSignInSubtitle:
    'Sign in with Google or email to sync across devices. Skip anytime — local progress still works.',
  welcomeSkipSignIn: 'Skip — go to Today',
  welcomeRemindersOptIn:
    'Email me training reminders (streak at risk, next step). Optional — unsubscribe anytime.',
  editJourneyProfile: 'Edit journey profile',
  saveProfile: 'Save profile',
};

const zh: WelcomeStrings = {
  ...en,
  welcomeKicker: '旅程从这里开始',
  welcomeIDay: '入门日',
  welcomeMissionLead: '使命：',
  welcomeMissionBody1:
    'Mission Winning 是一款免费全球健康应用。训练、营养、活动、心理、追踪、学习 — 一个应用，一条道路。',
  welcomeMissionP2: '基础功能永久免费。高级功能深化各支柱 — 入门无需付费。',
  welcomeMissionP3: '今天的任务：一步一步完成。今日页面始终显示你的下一个行动。',
  welcomeProfileTitle: '三个简单问题',
  welcomeProfileEditHint: '更新经验、装备和目标。登录后同步。',
  welcomeProfileHint: '以便今日为你推荐合适的起点。',
  welcomeExperience: '训练经验',
  welcomeExpBeginner: '新手',
  welcomeExpIntermediate: '有一些经验',
  welcomeExpAdvanced: '训练多年',
  welcomeGearCheck: '装备 — 你今天有什么？',
  welcomeEquipBodyweight: '仅自重',
  welcomeEquipDumbbells: '哑铃或弹力带',
  welcomeEquipFullGym: '完整健身房',
  welcomePrimaryGoal: '主要目标',
  welcomeGoalPlaceholder: '增强力量，保持健康',
  goalPresetStrength: '增强力量，保持健康',
  goalPresetFatLoss: '减脂并保持肌肉',
  goalPresetEndurance: '提升耐力与持久力',
  goalPresetMobility: '改善活动度与恢复',
  goalPresetGeneral: '保持健康、坚持训练',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: '快捷选择（或在下方自定义）',
  welcomeBack: '返回',
  headerSignIn: '登录',
  photoLogTitle: '拍照记录',
  photoLogDesc: '拍摄餐食 — 我们将估算营养（测试版即将推出）。',
  photoLogChoose: '选择照片',
  photoLogComingSoon: '拍照记录开发中。请先用快速记录或食谱。',
  photoLogBetaNote: '隐私优先 — 尽可能在设备上处理。',
  navOurMission: '我们的使命',
  navBetaGuide: '测试指南',
};

const id: WelcomeStrings = {
  ...en,
  welcomeKicker: 'Perjalanan dimulai di sini',
  welcomeIDay: 'Hari-I',
  welcomeMissionLead: 'Misi:',
  welcomeMissionBody1:
    'Mission Winning adalah app kesehatan global gratis. Latihan, nutrisi, gerak, pikiran, lacak, dan belajar — satu tempat, satu jalan.',
  welcomeMissionP2:
    'Dasar gratis selamanya. Premium memperdalam setiap pilar — tidak wajib untuk memulai.',
  welcomeMissionP3:
    'Tugas hari ini: selesaikan satu langkah. Tab Hari ini selalu menampilkan aksi berikutnya.',
  welcomeProfileTitle: 'Tiga pertanyaan singkat',
  welcomeProfileEditHint: 'Perbarui pengalaman, peralatan, dan tujuan. Sinkron saat masuk.',
  welcomeProfileHint: 'Agar Hari ini bisa merekomendasikan titik awal yang tepat.',
  welcomeExperience: 'Pengalaman',
  welcomeExpBeginner: 'Baru mulai latihan',
  welcomeExpIntermediate: 'Sudah berpengalaman',
  welcomeExpAdvanced: 'Latihan bertahun-tahun',
  welcomeGearCheck: 'Peralatan — apa yang Anda punya hari ini?',
  welcomeEquipBodyweight: 'Berat badan saja',
  welcomeEquipDumbbells: 'Dumbbell atau band',
  welcomeEquipFullGym: 'Akses gym lengkap',
  welcomePrimaryGoal: 'Tujuan utama',
  welcomeGoalPlaceholder: 'Bangun kekuatan dan tetap sehat',
  goalPresetStrength: 'Bangun kekuatan dan tetap sehat',
  goalPresetFatLoss: 'Turunkan lemak, pertahankan otot',
  goalPresetEndurance: 'Tingkatkan daya tahan',
  goalPresetMobility: 'Gerak lebih baik — mobilitas & recovery',
  goalPresetGeneral: 'Tetap sehat dan konsisten',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'Pilihan cepat (atau ketik sendiri di bawah)',
  welcomeBack: 'Kembali',
  headerSignIn: 'Masuk',
  photoLogTitle: 'Catat dari foto',
  photoLogDesc: 'Foto makanan — kami estimasi makro (beta segera).',
  photoLogChoose: 'Pilih foto',
  photoLogComingSoon: 'Log foto sedang dikembangkan. Gunakan log cepat atau resep dulu.',
  photoLogBetaNote: 'Privasi dulu — diproses di perangkat jika memungkinkan.',
  navOurMission: 'Misi kami',
  navBetaGuide: 'Panduan beta',
};

const th: WelcomeStrings = {
  ...en,
  welcomeKicker: 'จุดเริ่มต้นของเส้นทาง',
  welcomeIDay: 'วัน I',
  welcomeMissionLead: 'ภารกิจ:',
  welcomeMissionBody1:
    'Mission Winning เป็นแอปสุขภาพโลกฟรี ฝึก โภชนาการ เคลื่อนไหว จิต ติดตาม และเรียนรู้ — ที่เดียว เส้นทางเดียว',
  welcomeMissionP2: 'พื้นฐานฟรีตลอดไป พรีเมียมเพิ่มความลึก — ไม่จำเป็นต้องเริ่ม',
  welcomeMissionP3: 'งานวันนี้: ทำทีละขั้น หน้าวันนี้จะแสดงการกระทำถัดไปเสมอ',
  welcomeProfileTitle: 'สามคำถามสั้นๆ',
  welcomeProfileEditHint: 'อัปเดตประสบการณ์ อุปกรณ์ และเป้าหมาย ซิงค์เมื่อลงชื่อเข้าใช้',
  welcomeProfileHint: 'เพื่อให้วันนี้แนะนำจุดเริ่มต้นที่เหมาะสม',
  welcomeExperience: 'ประสบการณ์',
  welcomeExpBeginner: 'ใหม่กับการฝึก',
  welcomeExpIntermediate: 'มีประสบการณ์บ้าง',
  welcomeExpAdvanced: 'ฝึกมาหลายปี',
  welcomeGearCheck: 'อุปกรณ์ — วันนี้มีอะไรบ้าง?',
  welcomeEquipBodyweight: 'น้ำหนักตัวอย่างเดียว',
  welcomeEquipDumbbells: 'ดัมเบลหรือยาง',
  welcomeEquipFullGym: 'ยิมครบ',
  welcomePrimaryGoal: 'เป้าหมายหลัก',
  welcomeGoalPlaceholder: 'สร้างความแข็งแรงและสุขภาพดี',
  goalPresetStrength: 'สร้างความแข็งแรงและสุขภาพดี',
  goalPresetFatLoss: 'ลดไขมัน รักษากล้ามเนื้อ',
  goalPresetEndurance: 'เพิ่มความอดทน',
  goalPresetMobility: 'เคลื่อนไหวดีขึ้น — ความคล่องตัวและฟื้นตัว',
  goalPresetGeneral: 'สุขภาพดีและสม่ำเสมอ',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'เลือกด่วน (หรือพิมพ์เองด้านล่าง)',
  welcomeBack: 'ย้อนกลับ',
  headerSignIn: 'ลงชื่อเข้าใช้',
  photoLogTitle: 'บันทึกจากรูป',
  photoLogDesc: 'ถ่ายมื้ออาหาร — ประมาณค่าโภชนาการ (เบต้าเร็วๆ นี้)',
  photoLogChoose: 'เลือกรูป',
  photoLogComingSoon: 'กำลังพัฒนาบันทึกจากรูป ใช้บันทึกด่วนหรือสูตรก่อน',
  photoLogBetaNote: 'ความเป็นส่วนตัวก่อน — ประมวลผลบนอุปกรณ์เมื่อเป็นไปได้',
  navOurMission: 'ภารกิจของเรา',
  navBetaGuide: 'คู่มือเบต้า',
};

const ar: WelcomeStrings = {
  ...en,
  welcomeKicker: 'حيث تبدأ الرحلة',
  welcomeIDay: 'يوم البداية',
  welcomeMissionLead: 'المهمة:',
  welcomeMissionBody1:
    'Mission Winning تطبيق صحي عالمي مجاني. تدريب، تغذية، حركة، عقل، تتبع وتعلّم — مكان واحد، مسار واحد.',
  welcomeMissionP2:
    'الأساسيات مجانية للأبد. Premium يعمّق كل ركيزة لمن يريد المزيد — ليس مطلوباً للبدء.',
  welcomeMissionP3: 'مهمتك اليوم: أكمل خطوة بخطوة. صفحة اليوم تعرض دائماً إجراءك التالي.',
  welcomeProfileTitle: 'ثلاثة أسئلة سريعة',
  welcomeProfileEditHint: 'حدّث الخبرة والمعدات والهدف. يتم المزامنة عند تسجيل الدخول.',
  welcomeProfileHint: 'ليقترح اليوم نقطة البداية المناسبة.',
  welcomeExperience: 'الخبرة',
  welcomeExpBeginner: 'مبتدئ',
  welcomeExpIntermediate: 'خبرة متوسطة',
  welcomeExpAdvanced: 'متمرّس سنوات',
  welcomeGearCheck: 'فحص المعدات — ماذا لديك اليوم؟',
  welcomeEquipBodyweight: 'وزن الجسم فقط',
  welcomeEquipDumbbells: 'دمبل أو أشرطة',
  welcomeEquipFullGym: 'صالة كاملة',
  welcomePrimaryGoal: 'الهدف الرئيسي',
  welcomeGoalPlaceholder: 'بناء القوة والحفاظ على الصحة',
  goalPresetStrength: 'بناء القوة والحفاظ على الصحة',
  goalPresetFatLoss: 'خسارة الدهون مع الحفاظ على العضلات',
  goalPresetEndurance: 'تحسين التحمل والقدرة',
  goalPresetMobility: 'حركة أفضل — مرونة واستشفاء',
  goalPresetGeneral: 'صحة مستمرة وانتظام',
  goalPresetPft: 'Prepare for the Presidential Fitness Test',
  goalPresetKids: 'Get my kids moving every day',
  goalPresetAmericaHealth: 'Make America Healthy Again — start with me',
  welcomeGoalPresetsLabel: 'اختيارات سريعة (أو اكتب هدفك أدناه)',
  welcomeBack: 'رجوع',
  headerSignIn: 'تسجيل الدخول',
  photoLogTitle: 'تسجيل من صورة',
  photoLogDesc: 'صوّر وجبتك — نقدّر الماكرو (نسخة تجريبية قريباً).',
  photoLogChoose: 'اختر صورة',
  photoLogComingSoon: 'تسجيل الصور قيد التطوير. استخدم التسجيل السريع أو الوصفات.',
  photoLogBetaNote: 'التقاط الوجبات بأسلوب Bevel — الخصوصية أولاً على الجهاز عند الإمكان.',
  navOurMission: 'مهمتنا',
  navBetaGuide: 'دليل النسخة التجريبية',
};

const es: WelcomeStrings = {
  ...en,
  welcomeKicker: 'Donde comienza el camino',
  welcomeIDay: 'Día I',
  welcomeMissionLead: 'La misión:',
  welcomeMissionBody1:
    'Mission Winning es una app de salud global gratuita. Entrena, alimenta, muévete, mente, registro y aprende — un solo lugar, un camino.',
  welcomeMissionP2:
    'Lo fundamental es gratis para siempre. Premium profundiza cada pilar para quien quiera más — nunca obligatorio para empezar.',
  welcomeMissionP3:
    'Tu trabajo hoy: un paso a la vez. El hub Hoy siempre muestra tu siguiente acción.',
  welcomeProfileTitle: 'Tres preguntas rápidas',
  welcomeProfileEditHint:
    'Actualiza experiencia, equipo y objetivo. Los cambios se sincronizan al iniciar sesión.',
  welcomeProfileHint: 'Para que Hoy recomiende el mejor punto de partida.',
  welcomeExperience: 'Experiencia',
  welcomeExpBeginner: 'Nuevo en el entrenamiento',
  welcomeExpIntermediate: 'Algo de experiencia',
  welcomeExpAdvanced: 'Años entrenando',
  welcomeGearCheck: 'Equipo — ¿qué tienes hoy?',
  welcomeEquipBodyweight: 'Solo peso corporal',
  welcomeEquipDumbbells: 'Mancuernas o bandas',
  welcomeEquipFullGym: 'Gimnasio completo',
  welcomePrimaryGoal: 'Objetivo principal',
  welcomeGoalPresetsLabel: 'Opciones rápidas (o escribe el tuyo abajo)',
  welcomeBack: 'Atrás',
  headerSignIn: 'Entrar',
  photoLogTitle: 'Registrar con foto',
  navOurMission: 'Nuestra misión',
  navBetaGuide: 'Guía beta',
  welcomeTitle: 'Bienvenido, miembro de la misión',
  welcomeSubtitle:
    'Comienza tu camino hacia la salud de por vida — un paso a la vez. Unos dos minutos.',
  welcomeBegin: 'Comenzar',
  welcomeAccept: 'Acepto el camino',
  welcomeContinue: 'Continuar',
  welcomeSignInTitle: 'Guardar progreso — tu elección',
  welcomeSignInSubtitle:
    'Inicia sesión con Google o correo para sincronizar. Omite cuando quieras — el progreso local funciona.',
  welcomeSkipSignIn: 'Omitir — ir a Hoy',
  welcomeRemindersOptIn:
    'Envíame recordatorios de entrenamiento (racha en riesgo, siguiente paso). Opcional — cancela cuando quieras.',
  editJourneyProfile: 'Editar perfil del viaje',
  saveProfile: 'Guardar perfil',
};

const fr: WelcomeStrings = {
  ...en,
  welcomeKicker: 'Là où le chemin commence',
  welcomeIDay: 'Jour I',
  welcomeMissionLead: 'La mission :',
  welcomeMissionBody1:
    'Mission Winning est une app santé mondiale gratuite. Entraînez-vous, alimentez-vous, bougez, esprit, suivi et apprentissage — un seul endroit, un chemin.',
  welcomeMissionP2:
    'Les bases sont gratuites pour toujours. Premium approfondit chaque pilier pour qui veut plus — jamais obligatoire pour commencer.',
  welcomeMissionP3:
    'Votre travail aujourd’hui : une étape à la fois. Le hub Aujourd’hui montre toujours votre prochaine action.',
  welcomeProfileTitle: 'Trois questions rapides',
  welcomeProfileEditHint:
    'Mettez à jour expérience, matériel et objectif. Les changements se synchronisent à la connexion.',
  welcomeProfileHint: 'Pour qu’Aujourd’hui recommande le meilleur point de départ.',
  welcomeExperience: 'Expérience',
  welcomeExpBeginner: 'Nouveau à l’entraînement',
  welcomeExpIntermediate: 'Un peu d’expérience',
  welcomeExpAdvanced: 'Des années d’entraînement',
  welcomeGearCheck: 'Matériel — qu’avez-vous aujourd’hui ?',
  welcomeEquipBodyweight: 'Poids du corps seulement',
  welcomeEquipDumbbells: 'Haltères ou bandes',
  welcomeEquipFullGym: 'Salle complète',
  welcomePrimaryGoal: 'Objectif principal',
  welcomeGoalPresetsLabel: 'Choix rapides (ou écrivez le vôtre ci-dessous)',
  welcomeBack: 'Retour',
  headerSignIn: 'Connexion',
  photoLogTitle: 'Enregistrer avec une photo',
  navOurMission: 'Notre mission',
  navBetaGuide: 'Guide bêta',
  welcomeTitle: 'Bienvenue, membre de la mission',
  welcomeSubtitle:
    'Commencez votre chemin vers une santé durable — une étape à la fois. Environ deux minutes.',
  welcomeBegin: 'Commencer',
  welcomeAccept: 'J’accepte le chemin',
  welcomeContinue: 'Continuer',
  welcomeSignInTitle: 'Sauvegarder la progression — à vous de choisir',
  welcomeSignInSubtitle:
    'Connectez-vous avec Google ou e-mail pour synchroniser. Passez quand vous voulez — le progrès local fonctionne.',
  welcomeSkipSignIn: 'Passer — aller à Aujourd’hui',
  welcomeRemindersOptIn:
    'Envoyez-moi des rappels d’entraînement (série en danger, prochaine étape). Optionnel — désabonnement en un clic.',
  editJourneyProfile: 'Modifier le profil de parcours',
  saveProfile: 'Enregistrer le profil',
};

const pt: WelcomeStrings = {
  ...en,
  welcomeTitle: 'Bem-vindo, membro da missão',
  welcomeBegin: 'Começar',
  welcomeContinue: 'Continuar',
  welcomeSkipSignIn: 'Pular — ir para Hoje',
};

const de: WelcomeStrings = {
  ...en,
  welcomeKicker: 'Hier beginnt der Weg',
  welcomeIDay: 'I-Tag',
  welcomeMissionLead: 'Die Mission:',
  welcomeMissionBody1:
    'Mission Winning ist eine kostenlose globale Gesundheits-App. Trainiere, ernähre dich, bewege dich, Geist, Tracking und Lernen — an einem Ort, auf einem Weg.',
  welcomeMissionP2:
    'Die Grundlagen sind für immer kostenlos. Premium vertieft jede Säule für alle, die mehr wollen — nie Pflicht zum Start.',
  welcomeMissionP3:
    'Deine Aufgabe heute: ein Schritt nach dem anderen. Der Heute-Hub zeigt immer deine nächste Aktion.',
  welcomeProfileTitle: 'Drei kurze Fragen',
  welcomeProfileEditHint:
    'Aktualisiere Erfahrung, Equipment und Ziel. Änderungen synchronisieren sich bei Anmeldung.',
  welcomeProfileHint: 'Damit Heute den besten Startpunkt empfiehlt.',
  welcomeExperience: 'Erfahrung',
  welcomeExpBeginner: 'Neu beim Training',
  welcomeExpIntermediate: 'Etwas Erfahrung',
  welcomeExpAdvanced: 'Jahre Training',
  welcomeGearCheck: 'Equipment — was hast du heute?',
  welcomeEquipBodyweight: 'Nur Körpergewicht',
  welcomeEquipDumbbells: 'Hanteln oder Bänder',
  welcomeEquipFullGym: 'Volles Fitnessstudio',
  welcomePrimaryGoal: 'Hauptziel',
  welcomeGoalPresetsLabel: 'Schnellauswahl (oder schreib dein eigenes unten)',
  welcomeBack: 'Zurück',
  headerSignIn: 'Anmelden',
  photoLogTitle: 'Mit Foto protokollieren',
  navOurMission: 'Unsere Mission',
  navBetaGuide: 'Beta-Guide',
  welcomeTitle: 'Willkommen, Missionsmitglied',
  welcomeSubtitle:
    'Starte deinen Weg zu nachhaltiger Gesundheit — Schritt für Schritt. Etwa zwei Minuten.',
  welcomeBegin: 'Starten',
  welcomeAccept: 'Ich nehme den Weg an',
  welcomeContinue: 'Weiter',
  welcomeSignInTitle: 'Fortschritt speichern — deine Wahl',
  welcomeSignInSubtitle:
    'Melde dich mit Google oder E-Mail an zum Synchronisieren. Überspringe jederzeit — lokaler Fortschritt funktioniert.',
  welcomeSkipSignIn: 'Überspringen — zu Heute',
  welcomeRemindersOptIn:
    'Schick mir Trainingserinnerungen (Serie in Gefahr, nächster Schritt). Optional — Abmeldung mit einem Klick.',
  editJourneyProfile: 'Reiseprofil bearbeiten',
  saveProfile: 'Profil speichern',
};

const it: WelcomeStrings = {
  ...en,
  welcomeTitle: 'Benvenuto, membro della missione',
  welcomeBegin: 'Inizia',
  welcomeContinue: 'Continua',
  welcomeSkipSignIn: 'Salta — vai a Oggi',
};

const ko: WelcomeStrings = {
  ...en,
  welcomeTitle: '환영합니다, 미션 멤버',
  welcomeBegin: '시작',
  welcomeContinue: '계속',
  welcomeSkipSignIn: '건너뛰기 — 오늘로',
};

const LOCALES: Partial<Record<string, WelcomeStrings>> = {
  en,
  zh,
  id,
  th,
  es,
  ar,
  fr,
  pt,
  de,
  it,
  ko,
};

export function welcomeStringsFor(lang: string): WelcomeStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeWelcomeStrings(
  target: Record<string, string>,
  lang: string
): void {
  Object.assign(target, welcomeStringsFor(lang));
}
