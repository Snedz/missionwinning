/** Today hub UI copy — merged into i18n `common` namespace. */

type TodayStrings = {
  todayBasicEncouragement: string;
  todaySectionHealth: string;
  todaySectionHealthDesc: string;
  todaySectionWeek: string;
  todaySectionWeekDesc: string;
  todayWeeklyChallenges: string;
  todayWeeklyChallengesDesc: string;
  todayDayStreak: string;
  todayStartWorkout: string;
  todaySectionProgress: string;
  todaySectionProgressDesc: string;
  todayQuickOptions: string;
  todayQuickOptionsDesc: string;
  todayBuildCustom: string;
  todayMuscleReadiness: string;
  todayMuscleReadinessDesc: string;
  todayNoRecentData: string;
  todayDaysRest: string;
  todayTrainGroup: string;
  todayMuscleReadinessFoot: string;
  todayRecommendedStart: string;
  todayRecommendedStartDesc: string;
  todayFocusLabel: string;
  todayWithBodyweight: string;
  todayWithEquipment: string;
  todayRecommendedBody: string;
  todayGoBuilder: string;
  todayStatSessions: string;
  todayStatVolume: string;
  todayStatSaved: string;
  todayStatStreak: string;
  todayStatDays: string;
  todayRecentWins: string;
  todayViewHistory: string;
  todayYourWins: string;
  todayYourWinsDesc: string;
  todayViewLeaderboard: string;
  todayInstallPwa: string;
  todayInstallNow: string;
  todayBodyweightTag: string;
  fuelTitle: string;
  fuelSubtitle: string;
  fuelSignInDesc: string;
  todayCustomizeTitle: string;
  todayCustomizeDesc: string;
  todayMoveSectionUp: string;
  todayMoveSectionDown: string;
  challengeTrain7Title: string;
  challengeTrain7Desc: string;
  challengeProtein5Title: string;
  challengeProtein5Desc: string;
  challengeVolume10kTitle: string;
  challengeVolume10kDesc: string;
  photoLogProcessing: string;
  photoLogEstimateTitle: string;
  photoLogEstimateLow: string;
  photoLogLogEstimate: string;
  photoLogRetake: string;
  todayWin7DayStreak: string;
  todayWinVolume: string;
  todayWinSessions: string;
  todayWinSavedRoutines: string;
  todayWinProteinDays: string;
  todayWinUnderStars: string;
  todayWinDawn: string;
  todayWinBadgeFoot: string;
  todayRankings: string;
  todayAssessmentCardTitle: string;
  todayAssessmentLast: string;
  todayAssessmentRetake: string;
  todayAssessmentNone: string;
  todayAssessmentTake: string;
  todayRecentPillarWinsLabel: string;
  todaySeeNutritionLink: string;
  todayPillarWinEmpty: string;
};

const en: TodayStrings = {
  todayBasicEncouragement:
    'One step at a time. Health for everyone — train, fuel, move, and learn on your path.',
  todaySectionHealth: 'Health scores',
  todaySectionHealthDesc: 'Coach insight and pillar breakdown',
  todaySectionWeek: 'This week',
  todaySectionWeekDesc: 'Challenges and daily workout',
  todayWeeklyChallenges: 'Weekly Challenges',
  todayWeeklyChallengesDesc: 'Train + Fuel + volume goals this week. Free core — no premium required.',
  todayDayStreak: '{{count}}-day streak',
  todayStartWorkout: "Start Today's Workout",
  todaySectionProgress: 'Progress & tools',
  todaySectionProgressDesc: 'Readiness, stats, and history',
  todayQuickOptions: 'Quick options',
  todayQuickOptionsDesc: 'Free starter programs and saved routines.',
  todayBuildCustom: 'Build a custom session →',
  todayMuscleReadiness: 'Muscle Readiness',
  todayMuscleReadinessDesc: 'Based on your recent training history. Prime groups are ready for focus.',
  todayNoRecentData: 'No recent data',
  todayDaysRest: '{{days}}d rest',
  todayTrainGroup: 'Train {{group}} now →',
  todayMuscleReadinessFoot: 'Train prime groups for best results. Rest others. Your logs make this smarter over time.',
  todayRecommendedStart: 'Recommended Starting Point',
  todayRecommendedStartDesc: 'Based on your mission setup (edit in Profile).',
  todayFocusLabel: 'Focus:',
  todayWithBodyweight: 'with bodyweight/minimal',
  todayWithEquipment: 'with available equipment',
  todayRecommendedBody:
    'Start with a simple full-body or split from Builder, or launch a program template. Complete sessions to level up your Win Score.',
  todayGoBuilder: 'Go to Builder / Choose Template →',
  todayStatSessions: 'Sessions',
  todayStatVolume: 'Total Volume',
  todayStatSaved: 'Saved Routines',
  todayStatStreak: 'Current Streak',
  todayStatDays: 'days',
  todayRecentWins: 'Recent Wins',
  todayViewHistory: 'View full history →',
  todayYourWins: 'Your Wins & Streaks',
  todayYourWinsDesc:
    'Proof you are taking massive action. Complete these for badges and coaching priority.',
  todayViewLeaderboard: 'View Leaderboard →',
  todayInstallPwa: 'Install Mission Winning for offline use anywhere (PWA).',
  todayInstallNow: 'Install Now',
  todayBodyweightTag: 'bodyweight',
  fuelTitle: 'Nutrition',
  fuelSubtitle:
    'Free core: daily macro log, water, targets, and accessible recipes worldwide.',
  fuelSignInDesc: 'Sync meals and macro history across devices.',
  todayCustomizeTitle: 'Customize Today',
  todayCustomizeDesc: 'Choose which sections appear below and their order. Saved on this device.',
  todayMoveSectionUp: 'Move up',
  todayMoveSectionDown: 'Move down',
  challengeTrain7Title: '7-Day Train Streak',
  challengeTrain7Desc: 'Log a workout on 7 separate days this week.',
  challengeProtein5Title: '5 High-Protein Days',
  challengeProtein5Desc: 'Hit 120g+ protein on 5 days (Fuel pillar).',
  challengeVolume10kTitle: '10K Volume Week',
  challengeVolume10kDesc: 'Accumulate 10,000 lb·reps volume this week.',
  photoLogProcessing: 'Estimating on device…',
  photoLogEstimateTitle: 'Estimated meal',
  photoLogEstimateLow: 'Low confidence — edit after logging if needed.',
  photoLogLogEstimate: 'Log estimate',
  photoLogRetake: 'Choose another photo',
  todayWin7DayStreak: '7-Day Streak ({{current}}/7)',
  todayWinVolume: '1000kg+ Total Volume ({{current}}/1000)',
  todayWinSessions: '15+ Sessions Logged ({{current}}/15)',
  todayWinSavedRoutines: '3+ Saved Routines ({{current}}/3)',
  todayWinProteinDays: 'High Protein Days (150g+) ({{current}}/5+)',
  todayWinUnderStars: 'Under the Stars ({{current}}/3 night sessions)',
  todayWinDawn: "By Dawn's Early Light ({{current}}/3 dawn sessions)",
  todayWinBadgeFoot:
    'Log wins daily — streaks & volume feed your Mission Score. Full cross-pillar challenges in updates.',
  todayRankings: 'Rankings',
  todayAssessmentCardTitle: 'Last Assessment & Recent Pillar Wins',
  todayAssessmentLast: 'Last: {{risk}} risk ({{date}})',
  todayAssessmentRetake: 'Retake',
  todayAssessmentNone: 'No assessment yet.',
  todayAssessmentTake: 'Take free Readiness Assessment →',
  todayRecentPillarWinsLabel: 'Recent pillar wins:',
  todaySeeNutritionLink: 'See full in Nutrition →',
  todayPillarWinEmpty: 'Log wins from Move or Mind (saves to cloud when signed in).',
};

const es: TodayStrings = {
  ...en,
  todayBasicEncouragement:
    'Un paso a la vez. Salud para todos — entrena, alimenta, muévete y aprende en tu camino.',
  todaySectionHealth: 'Puntuaciones de salud',
  todaySectionHealthDesc: 'Perspectiva del coach y desglose por pilares',
  todaySectionWeek: 'Esta semana',
  todaySectionWeekDesc: 'Desafíos y entrenamiento diario',
  todayWeeklyChallenges: 'Desafíos semanales',
  todayWeeklyChallengesDesc: 'Metas de entrenamiento + nutrición + volumen. Núcleo gratis.',
  todayDayStreak: 'Racha de {{count}} días',
  todayStartWorkout: 'Empezar entrenamiento de hoy',
  todaySectionProgress: 'Progreso y herramientas',
  todaySectionProgressDesc: 'Preparación, estadísticas e historial',
  todayQuickOptions: 'Opciones rápidas',
  todayQuickOptionsDesc: 'Programas gratuitos y rutinas guardadas.',
  todayBuildCustom: 'Crear sesión personalizada →',
  todayMuscleReadiness: 'Preparación muscular',
  todayMuscleReadinessDesc: 'Según tu historial reciente. Grupos listos para enfoque.',
  todayNoRecentData: 'Sin datos recientes',
  todayDaysRest: '{{days}}d descanso',
  todayTrainGroup: 'Entrenar {{group}} →',
  todayRecommendedStart: 'Punto de partida recomendado',
  todayRecommendedStartDesc: 'Según tu configuración (editar en Perfil).',
  todayFocusLabel: 'Enfoque:',
  todayWithBodyweight: 'con peso corporal/mínimo',
  todayWithEquipment: 'con equipo disponible',
  todayGoBuilder: 'Ir al Builder / plantilla →',
  todayStatSessions: 'Sesiones',
  todayStatVolume: 'Volumen total',
  todayStatSaved: 'Rutinas guardadas',
  todayStatStreak: 'Racha actual',
  todayStatDays: 'días',
  todayRecentWins: 'Victorias recientes',
  todayViewHistory: 'Ver historial completo →',
  todayYourWins: 'Tus victorias y rachas',
  todayViewLeaderboard: 'Ver clasificación →',
  todayInstallPwa: 'Instala Mission Winning para uso sin conexión (PWA).',
  todayInstallNow: 'Instalar ahora',
  todayBodyweightTag: 'peso corporal',
  fuelTitle: 'Nutrición',
  fuelSignInDesc: 'Sincroniza comidas e historial de macros entre dispositivos.',
  todayCustomizeTitle: 'Personalizar Hoy',
  todayCustomizeDesc: 'Elige qué secciones ver. Guardado en este dispositivo.',
  challengeTrain7Title: 'Racha de 7 días',
  challengeTrain7Desc: 'Registra entrenamiento en 7 días distintos esta semana.',
  challengeProtein5Title: '5 días alta proteína',
  challengeProtein5Desc: '120g+ proteína en 5 días (pilar Fuel).',
  challengeVolume10kTitle: '10K volumen semanal',
  challengeVolume10kDesc: 'Acumula 10.000 de volumen esta semana.',
  photoLogProcessing: 'Estimando en el dispositivo…',
  photoLogEstimateTitle: 'Comida estimada',
  photoLogEstimateLow: 'Baja confianza — edita después si hace falta.',
  photoLogLogEstimate: 'Registrar estimación',
  photoLogRetake: 'Elegir otra foto',
  todayWin7DayStreak: 'Racha de 7 días ({{current}}/7)',
  todayWinVolume: '1000kg+ volumen total ({{current}}/1000)',
  todayWinSessions: '15+ sesiones ({{current}}/15)',
  todayWinSavedRoutines: '3+ rutinas guardadas ({{current}}/3)',
  todayWinProteinDays: 'Días alta proteína 150g+ ({{current}}/5+)',
  todayWinUnderStars: 'Bajo las estrellas ({{current}}/3 sesiones nocturnas)',
  todayWinDawn: 'Al amanecer ({{current}}/3 sesiones al alba)',
  todayWinBadgeFoot:
    'Registra victorias a diario — rachas y volumen alimentan tu Puntuación de Misión.',
  todayRankings: 'Clasificación',
  todayAssessmentCardTitle: 'Última evaluación y victorias recientes',
  todayAssessmentLast: 'Última: riesgo {{risk}} ({{date}})',
  todayAssessmentRetake: 'Repetir',
  todayAssessmentNone: 'Sin evaluación aún.',
  todayAssessmentTake: 'Hacer evaluación de preparación gratis →',
  todayRecentPillarWinsLabel: 'Victorias recientes por pilar:',
  todaySeeNutritionLink: 'Ver todo en Nutrición →',
  todayPillarWinEmpty: 'Registra victorias en Move o Mind (se guarda en la nube al iniciar sesión).',
};

const zh: TodayStrings = {
  todayBasicEncouragement: '一步一步来。健康属于每个人 — 在你的路上训练、营养、活动和学习。',
  todaySectionHealth: '健康评分',
  todaySectionHealthDesc: '教练洞察与支柱分解',
  todaySectionWeek: '本周',
  todaySectionWeekDesc: '挑战与每日训练',
  todayWeeklyChallenges: '每周挑战',
  todayWeeklyChallengesDesc: '本周训练 + 营养 + 容量目标。免费核心 — 无需高级版。',
  todayDayStreak: '{{count}} 天连续',
  todayStartWorkout: '开始今日训练',
  todaySectionProgress: '进度与工具',
  todaySectionProgressDesc: '就绪度、统计与历史',
  todayQuickOptions: '快捷选项',
  todayQuickOptionsDesc: '免费入门计划与已保存的 routine。',
  todayBuildCustom: '创建自定义训练 →',
  todayMuscleReadiness: '肌肉就绪度',
  todayMuscleReadinessDesc: '基于近期训练记录。最佳肌群已准备好重点训练。',
  todayNoRecentData: '暂无近期数据',
  todayDaysRest: '休息 {{days}} 天',
  todayTrainGroup: '立即训练 {{group}} →',
  todayMuscleReadinessFoot: '重点训练就绪肌群效果最佳。其他肌群休息。记录越多越智能。',
  todayRecommendedStart: '推荐起点',
  todayRecommendedStartDesc: '基于你的任务设置（在资料中编辑）。',
  todayFocusLabel: '重点：',
  todayWithBodyweight: '自重/极简装备',
  todayWithEquipment: '可用器械',
  todayRecommendedBody: '从 Builder 选择全身或分化训练，或启动计划模板。完成训练提升任务分数。',
  todayGoBuilder: '前往 Builder / 选择模板 →',
  todayStatSessions: '训练次数',
  todayStatVolume: '总容量',
  todayStatSaved: '已保存 routine',
  todayStatStreak: '当前连续',
  todayStatDays: '天',
  todayRecentWins: '近期胜利',
  todayViewHistory: '查看完整历史 →',
  todayYourWins: '你的胜利与连续',
  todayYourWinsDesc: '大量行动的证据。完成可获得徽章与教练优先权。',
  todayViewLeaderboard: '查看排行榜 →',
  todayInstallPwa: '安装 Mission Winning 以便离线使用（PWA）。',
  todayInstallNow: '立即安装',
  todayBodyweightTag: '自重',
  fuelTitle: '营养',
  fuelSubtitle: '免费核心：每日宏量记录、饮水、目标与全球可及食谱。',
  fuelSignInDesc: '跨设备同步餐食与宏量历史。',
  todayCustomizeTitle: '自定义今日',
  todayCustomizeDesc: '选择下方显示的分区及顺序。仅保存在本设备。',
  todayMoveSectionUp: '上移',
  todayMoveSectionDown: '下移',
  challengeTrain7Title: '7 天训练连续',
  challengeTrain7Desc: '本周在 7 个不同日记录训练。',
  challengeProtein5Title: '5 天高蛋白质日',
  challengeProtein5Desc: '5 天蛋白质 ≥120g（营养支柱）。',
  challengeVolume10kTitle: '本周 10K 容量',
  challengeVolume10kDesc: '本周累计 10,000 训练容量。',
  photoLogProcessing: '正在本地估算…',
  photoLogEstimateTitle: '估算餐食',
  photoLogEstimateLow: '置信度较低 — 记录后可编辑。',
  photoLogLogEstimate: '记录估算',
  photoLogRetake: '重新选择照片',
  todayWin7DayStreak: '7 天连续 ({{current}}/7)',
  todayWinVolume: '1000kg+ 总容量 ({{current}}/1000)',
  todayWinSessions: '15+ 次训练 ({{current}}/15)',
  todayWinSavedRoutines: '3+ 已保存 routine ({{current}}/3)',
  todayWinProteinDays: '高蛋白质日 150g+ ({{current}}/5+)',
  todayWinUnderStars: '星空之下 ({{current}}/3 夜间训练)',
  todayWinDawn: '黎明之光 ({{current}}/3 清晨训练)',
  todayWinBadgeFoot: '每日记录胜利 — 连续与容量提升任务分数。',
  todayRankings: '排行榜',
  todayAssessmentCardTitle: '最近评估与支柱胜利',
  todayAssessmentLast: '最近：{{risk}} 风险 ({{date}})',
  todayAssessmentRetake: '重新评估',
  todayAssessmentNone: '尚未评估。',
  todayAssessmentTake: '免费就绪度评估 →',
  todayRecentPillarWinsLabel: '近期支柱胜利：',
  todaySeeNutritionLink: '在营养页查看全部 →',
  todayPillarWinEmpty: '在 Move 或 Mind 记录胜利（登录后同步云端）。',
};

const id: TodayStrings = {
  todayBasicEncouragement:
    'Satu langkah demi langkah. Kesehatan untuk semua — latihan, nutrisi, gerak, dan belajar.',
  todaySectionHealth: 'Skor kesehatan',
  todaySectionHealthDesc: 'Wawasan pelatih dan rincian pilar',
  todaySectionWeek: 'Minggu ini',
  todaySectionWeekDesc: 'Tantangan dan latihan harian',
  todayWeeklyChallenges: 'Tantangan mingguan',
  todayWeeklyChallengesDesc: 'Target latihan + nutrisi + volume minggu ini. Inti gratis.',
  todayDayStreak: 'Streak {{count}} hari',
  todayStartWorkout: 'Mulai latihan hari ini',
  todaySectionProgress: 'Progres & alat',
  todaySectionProgressDesc: 'Kesiapan, statistik, dan riwayat',
  todayQuickOptions: 'Opsi cepat',
  todayQuickOptionsDesc: 'Program starter gratis dan rutin tersimpan.',
  todayBuildCustom: 'Buat sesi kustom →',
  todayMuscleReadiness: 'Kesiapan otot',
  todayMuscleReadinessDesc: 'Berdasarkan riwayat latihan. Grup prime siap difokuskan.',
  todayNoRecentData: 'Belum ada data',
  todayDaysRest: 'istirahat {{days}}h',
  todayTrainGroup: 'Latih {{group}} sekarang →',
  todayMuscleReadinessFoot: 'Latih grup prime untuk hasil terbaik. Istirahatkan yang lain.',
  todayRecommendedStart: 'Titik awal yang disarankan',
  todayRecommendedStartDesc: 'Berdasarkan setup misi Anda (edit di Profil).',
  todayFocusLabel: 'Fokus:',
  todayWithBodyweight: 'dengan berat badan/minimal',
  todayWithEquipment: 'dengan peralatan tersedia',
  todayRecommendedBody:
    'Mulai dari Builder atau template program. Selesaikan sesi untuk meningkatkan Skor Misi.',
  todayGoBuilder: 'Ke Builder / pilih template →',
  todayStatSessions: 'Sesi',
  todayStatVolume: 'Volume total',
  todayStatSaved: 'Rutin tersimpan',
  todayStatStreak: 'Streak saat ini',
  todayStatDays: 'hari',
  todayRecentWins: 'Kemenangan terbaru',
  todayViewHistory: 'Lihat riwayat lengkap →',
  todayYourWins: 'Kemenangan & streak Anda',
  todayYourWinsDesc: 'Bukti aksi masif. Selesaikan untuk lencana dan prioritas pelatih.',
  todayViewLeaderboard: 'Lihat papan peringkat →',
  todayInstallPwa: 'Instal Mission Winning untuk offline (PWA).',
  todayInstallNow: 'Instal sekarang',
  todayBodyweightTag: 'berat badan',
  fuelTitle: 'Nutrisi',
  fuelSubtitle: 'Inti gratis: log makro harian, air, target, dan resep global.',
  fuelSignInDesc: 'Sinkronkan makanan dan riwayat makro antar perangkat.',
  todayCustomizeTitle: 'Sesuaikan Hari ini',
  todayCustomizeDesc: 'Pilih bagian yang ditampilkan. Disimpan di perangkat ini.',
  todayMoveSectionUp: 'Naik',
  todayMoveSectionDown: 'Turun',
  challengeTrain7Title: 'Streak latihan 7 hari',
  challengeTrain7Desc: 'Catat latihan di 7 hari berbeda minggu ini.',
  challengeProtein5Title: '5 hari protein tinggi',
  challengeProtein5Desc: '120g+ protein di 5 hari (pilar Nutrisi).',
  challengeVolume10kTitle: 'Volume 10K minggu ini',
  challengeVolume10kDesc: 'Akumulasi 10.000 volume minggu ini.',
  photoLogProcessing: 'Estimasi di perangkat…',
  photoLogEstimateTitle: 'Estimasi makanan',
  photoLogEstimateLow: 'Keyakinan rendah — edit setelah log jika perlu.',
  photoLogLogEstimate: 'Log estimasi',
  photoLogRetake: 'Pilih foto lain',
  todayWin7DayStreak: 'Streak 7 hari ({{current}}/7)',
  todayWinVolume: '1000kg+ volume total ({{current}}/1000)',
  todayWinSessions: '15+ sesi ({{current}}/15)',
  todayWinSavedRoutines: '3+ rutin tersimpan ({{current}}/3)',
  todayWinProteinDays: 'Hari protein tinggi 150g+ ({{current}}/5+)',
  todayWinUnderStars: 'Di bawah bintang ({{current}}/3 sesi malam)',
  todayWinDawn: 'Fajar ({{current}}/3 sesi pagi)',
  todayWinBadgeFoot: 'Log kemenangan harian — streak & volume menaikkan Skor Misi.',
  todayRankings: 'Peringkat',
  todayAssessmentCardTitle: 'Assesmen terakhir & kemenangan pilar',
  todayAssessmentLast: 'Terakhir: risiko {{risk}} ({{date}})',
  todayAssessmentRetake: 'Ulangi',
  todayAssessmentNone: 'Belum ada assesmen.',
  todayAssessmentTake: 'Assesmen kesiapan gratis →',
  todayRecentPillarWinsLabel: 'Kemenangan pilar terbaru:',
  todaySeeNutritionLink: 'Lihat lengkap di Nutrisi →',
  todayPillarWinEmpty: 'Log dari Move atau Mind (tersimpan cloud saat masuk).',
};

const th: TodayStrings = {
  todayBasicEncouragement:
    'ทีละขั้น สุขภาพสำหรับทุกคน — ฝึก โภชนาการ เคลื่อนไหว และเรียนรู้บนเส้นทางของคุณ',
  todaySectionHealth: 'คะแนนสุขภาพ',
  todaySectionHealthDesc: 'ข้อมูลโค้ชและแยกตามเสาหลัก',
  todaySectionWeek: 'สัปดาห์นี้',
  todaySectionWeekDesc: 'ความท้าทายและการฝึกรายวัน',
  todayWeeklyChallenges: 'ความท้าทายรายสัปดาห์',
  todayWeeklyChallengesDesc: 'เป้าหมายฝึก + โภชนาการ + ปริมาณ ฟรี — ไม่ต้องพรีเมียม',
  todayDayStreak: 'สตรีค {{count}} วัน',
  todayStartWorkout: 'เริ่มการฝึกวันนี้',
  todaySectionProgress: 'ความคืบหน้าและเครื่องมือ',
  todaySectionProgressDesc: 'ความพร้อม สถิติ และประวัติ',
  todayQuickOptions: 'ตัวเลือกด่วน',
  todayQuickOptionsDesc: 'โปรแกรมเริ่มต้นฟรีและ routine ที่บันทึก',
  todayBuildCustom: 'สร้างเซสชันเอง →',
  todayMuscleReadiness: 'ความพร้อมของกล้ามเนื้อ',
  todayMuscleReadinessDesc: 'จากประวัติการฝึกล่าสุด กลุ่มที่พร้อมเน้นได้',
  todayNoRecentData: 'ไม่มีข้อมูลล่าสุด',
  todayDaysRest: 'พัก {{days}} วัน',
  todayTrainGroup: 'ฝึก {{group}} ตอนนี้ →',
  todayMuscleReadinessFoot: 'ฝึกกลุ่มที่พร้อมเพื่อผลลัพธ์ดีที่สุด บันทึกยิ่งมากยิ่งฉลาด',
  todayRecommendedStart: 'จุดเริ่มต้นที่แนะนำ',
  todayRecommendedStartDesc: 'จากการตั้งค่าภารกิจ (แก้ไขในโปรไฟล์)',
  todayFocusLabel: 'โฟกัส:',
  todayWithBodyweight: 'น้ำหนักตัว/อุปกรณ์น้อย',
  todayWithEquipment: 'อุปกรณ์ที่มี',
  todayRecommendedBody: 'เริ่มจาก Builder หรือเทมเพลต ฝึกให้ครบเพื่อเพิ่มคะแนนภารกิจ',
  todayGoBuilder: 'ไป Builder / เลือกเทมเพลต →',
  todayStatSessions: 'เซสชัน',
  todayStatVolume: 'ปริมาณรวม',
  todayStatSaved: 'Routine ที่บันทึก',
  todayStatStreak: 'สตรีคปัจจุบัน',
  todayStatDays: 'วัน',
  todayRecentWins: 'ชัยชนะล่าสุด',
  todayViewHistory: 'ดูประวัติทั้งหมด →',
  todayYourWins: 'ชัยชนะและสตรีคของคุณ',
  todayYourWinsDesc: 'หลักฐานการลงมือ ทำให้ครบเพื่อเหรียญและความสำคัญจากโค้ช',
  todayViewLeaderboard: 'ดูอันดับ →',
  todayInstallPwa: 'ติดตั้ง Mission Winning ใช้งานออฟไลน์ (PWA)',
  todayInstallNow: 'ติดตั้งเลย',
  todayBodyweightTag: 'น้ำหนักตัว',
  fuelTitle: 'โภชนาการ',
  fuelSubtitle: 'ฟรี: บันทึกมาโคร น้ำ เป้าหมาย และสูตรอาหารทั่วโลก',
  fuelSignInDesc: 'ซิงค์มื้ออาหารและประวัติมาโครข้ามอุปกรณ์',
  todayCustomizeTitle: 'ปรับแต่งวันนี้',
  todayCustomizeDesc: 'เลือกส่วนที่แสดงด้านล่าง บันทึกบนอุปกรณ์นี้',
  todayMoveSectionUp: 'เลื่อนขึ้น',
  todayMoveSectionDown: 'เลื่อนลง',
  challengeTrain7Title: 'สตรีคฝึก 7 วัน',
  challengeTrain7Desc: 'บันทึกการฝึก 7 วันที่ต่างกันในสัปดาห์นี้',
  challengeProtein5Title: '5 วันโปรตีนสูง',
  challengeProtein5Desc: 'โปรตีน 120g+ ใน 5 วัน (เสาโภชนาการ)',
  challengeVolume10kTitle: 'ปริมาณ 10K สัปดาห์นี้',
  challengeVolume10kDesc: 'สะสมปริมาณ 10,000 ในสัปดาห์นี้',
  photoLogProcessing: 'กำลังประมาณบนอุปกรณ์…',
  photoLogEstimateTitle: 'ประมาณมื้ออาหาร',
  photoLogEstimateLow: 'ความมั่นใจต่ำ — แก้ไขหลังบันทึกได้',
  photoLogLogEstimate: 'บันทึกการประมาณ',
  photoLogRetake: 'เลือกรูปใหม่',
  todayWin7DayStreak: 'สตรีค 7 วัน ({{current}}/7)',
  todayWinVolume: 'ปริมาณรวม 1000kg+ ({{current}}/1000)',
  todayWinSessions: '15+ เซสชัน ({{current}}/15)',
  todayWinSavedRoutines: '3+ routine ที่บันทึก ({{current}}/3)',
  todayWinProteinDays: 'วันโปรตีนสูง 150g+ ({{current}}/5+)',
  todayWinUnderStars: 'ใต้แสงดาว ({{current}}/3 เซสชันกลางคืน)',
  todayWinDawn: 'แสงรุ่งอรุณ ({{current}}/3 เซสชันตอนเช้า)',
  todayWinBadgeFoot: 'บันทึกชัยชนะทุกวัน — สตรีคและปริมาณเพิ่มคะแนนภารกิจ',
  todayRankings: 'อันดับ',
  todayAssessmentCardTitle: 'การประเมินล่าสุดและชัยชนะเสาหลัก',
  todayAssessmentLast: 'ล่าสุด: ความเสี่ยง {{risk}} ({{date}})',
  todayAssessmentRetake: 'ทำใหม่',
  todayAssessmentNone: 'ยังไม่มีการประเมิน',
  todayAssessmentTake: 'ทำการประเมินความพร้อมฟรี →',
  todayRecentPillarWinsLabel: 'ชัยชนะเสาหลักล่าสุด:',
  todaySeeNutritionLink: 'ดูทั้งหมดในโภชนาการ →',
  todayPillarWinEmpty: 'บันทึกจาก Move หรือ Mind (ซิงค์คลาวด์เมื่อลงชื่อเข้าใช้)',
};

const LOCALES: Partial<Record<string, TodayStrings>> = { en, es, zh, id, th };

export function todayStringsFor(lang: string): TodayStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeTodayStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, todayStringsFor(lang));
}

export type { TodayStrings };
