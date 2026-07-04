/** Track pillar UI copy — merged into i18n `common` namespace. */

type TrackStrings = {
  trackTitle: string;
  trackSubtitle: string;
  trackWeekSessions: string;
  trackTotalTime: string;
  trackDistance: string;
  trackLogTitle: string;
  trackLogDesc: string;
  trackTypeLabel: string;
  trackDurationLabel: string;
  trackDistanceLabel: string;
  trackNotesLabel: string;
  trackNotesPlaceholder: string;
  trackLogBtn: string;
  trackWeekLogTitle: string;
  trackEmptyWeek: string;
  trackEmptyTitle: string;
  trackPremiumTitle: string;
  trackPremiumDesc: string;
  trackPremiumBtn: string;
  trackGpsTitle: string;
  trackGpsPremiumDesc: string;
  trackGpsUnsupported: string;
  trackGpsDenied: string;
  trackGpsTooShort: string;
  trackGpsRecording: string;
  trackGpsIdle: string;
  trackGpsStart: string;
  trackGpsStop: string;
  trackGpsSave: string;
};

const en: TrackStrings = {
  trackTitle: 'Track Activity',
  trackSubtitle:
    'Free manual activity log — walk, run, bike, hike. Premium adds GPS and advanced stats (MapMy-style, Super Bundle).',
  trackWeekSessions: 'This Week',
  trackTotalTime: 'Total Time',
  trackDistance: 'Distance',
  trackLogTitle: 'Log Activity',
  trackLogDesc: 'No GPS needed — manual entry works offline anywhere.',
  trackTypeLabel: 'Type',
  trackDurationLabel: 'Duration (minutes)',
  trackDistanceLabel: 'Distance km (optional)',
  trackNotesLabel: 'Notes (optional)',
  trackNotesPlaceholder: 'Morning park loop, felt great',
  trackLogBtn: 'Log Activity',
  trackWeekLogTitle: "This Week's Log",
  trackEmptyWeek: 'No activities yet this week. Log a walk or run above.',
  trackEmptyTitle: 'No activities this week',
  trackPremiumTitle: 'Premium — GPS & advanced stats',
  trackPremiumDesc: 'MapMy-style tracking, routes, pace charts, cross-pillar coaching.',
  trackPremiumBtn: 'Track Premium',
  trackGpsTitle: 'GPS track (Premium)',
  trackGpsPremiumDesc:
    'Record outdoor walks and runs with live distance — MapMy-style, Super Bundle.',
  trackGpsUnsupported: 'GPS not supported on this device.',
  trackGpsDenied: 'Location permission denied.',
  trackGpsTooShort: 'Need more GPS points — walk a bit longer.',
  trackGpsRecording: 'Recording… {{count}} points',
  trackGpsIdle: 'Start when you begin your walk or run.',
  trackGpsStart: 'Start GPS',
  trackGpsStop: 'Stop',
  trackGpsSave: 'Save to log',
};

const es: TrackStrings = {
  ...en,
  trackTitle: 'Registrar actividad',
  trackSubtitle:
    'Registro manual gratuito — caminar, correr, bici, senderismo. Premium añade GPS y estadísticas avanzadas.',
  trackWeekSessions: 'Esta semana',
  trackTotalTime: 'Tiempo total',
  trackDistance: 'Distancia',
  trackLogTitle: 'Registrar actividad',
  trackLogDesc: 'Sin GPS — entrada manual funciona offline.',
  trackLogBtn: 'Registrar',
  trackWeekLogTitle: 'Registro de la semana',
  trackEmptyWeek: 'Sin actividades esta semana. Registra una caminata arriba.',
};

const zh: TrackStrings = {
  ...en,
  trackTitle: '活动追踪',
  trackSubtitle: '免费手动记录步行、跑步、骑行、徒步。高级版增加 GPS 与进阶统计。',
  trackWeekSessions: '本周',
  trackTotalTime: '总时长',
  trackDistance: '距离',
  trackLogTitle: '记录活动',
  trackLogBtn: '记录',
  trackEmptyWeek: '本周尚无活动。请在上方记录一次步行或跑步。',
};

const id: TrackStrings = {
  ...en,
  trackTitle: 'Lacak aktivitas',
  trackWeekSessions: 'Minggu ini',
  trackLogTitle: 'Catat aktivitas',
  trackLogBtn: 'Catat',
  trackEmptyWeek: 'Belum ada aktivitas minggu ini.',
};

const th: TrackStrings = {
  ...en,
  trackTitle: 'บันทึกกิจกรรม',
  trackWeekSessions: 'สัปดาห์นี้',
  trackLogTitle: 'บันทึกกิจกรรม',
  trackLogBtn: 'บันทึก',
  trackEmptyWeek: 'ยังไม่มีกิจกรรมสัปดาห์นี้',
};

const ar: TrackStrings = {
  ...en,
  trackTitle: 'تتبع النشاط',
  trackWeekSessions: 'هذا الأسبوع',
  trackLogTitle: 'تسجيل نشاط',
  trackLogBtn: 'تسجيل',
  trackEmptyWeek: 'لا أنشطة هذا الأسبوع بعد.',
};

const LOCALES: Partial<Record<string, TrackStrings>> = { en, es, zh, id, th, ar };

export function trackStringsFor(lang: string): TrackStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeTrackStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, trackStringsFor(lang));
}
