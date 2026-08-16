/** Mission Server messenger strings — merged into i18n `common` namespace. */

const SERVER_EN: Record<string, string> = {
  serverChannelsLabel: 'Channels',
  serverMembersLabel: 'Members',
  serverMemberCount: '1 member',
  navServer: 'Messenger',
  moreServerDesc: 'Shared rooms when signed in',
  serverEyebrow: 'Mission Server',
  serverTitle: 'Garage',
  serverSubtitle: 'Shared rooms when signed in. Guests stay on this device. Not a feed.',
  serverChannelTrain: 'train',
  serverChannelGarage: 'garage',
  serverChannelOffTopic: 'off-topic',
  serverEmpty: 'No messages yet. Guests stay on this device. Signed-in rooms sync.',
  serverComposerPlaceholder: 'Message {{channel}}',
  serverSend: 'Send',
  serverMemberSelf: 'You',
  serverRoomsLabel: 'Rooms',
  serverWindowLabel: 'Chat',
  serverLocalNote:
    'Guests: this device only. Signed in: shared Garage rooms. Coach never reads the chat.',
  serverReport: 'Report',
  serverReported: 'Reported',
  serverPresenceLabel: 'Presence',
  serverPresenceAvailable: 'Available',
  serverPresenceAway: 'Away',
  serverPresenceOffline: 'Offline',
  serverNudge: 'Nudge',
  serverNudgeLine: 'Nudge',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: SERVER_EN,
  es: {
    ...SERVER_EN,
    navServer: 'Mensajería',
    serverSend: 'Enviar',
    serverMemberSelf: 'Tú',
    serverEmpty: 'Aún no hay mensajes. Quedan en este dispositivo.',
    serverPresenceAvailable: 'Disponible',
    serverPresenceAway: 'Ausente',
    serverPresenceOffline: 'Desconectado',
  },
  fr: {
    ...SERVER_EN,
    navServer: 'Messagerie',
    serverSend: 'Envoyer',
    serverMemberSelf: 'Toi',
    serverPresenceAvailable: 'Disponible',
    serverPresenceAway: 'Absent',
    serverPresenceOffline: 'Hors ligne',
  },
  pt: {
    ...SERVER_EN,
    navServer: 'Mensageiro',
    serverSend: 'Enviar',
    serverMemberSelf: 'Você',
    serverPresenceAvailable: 'Disponível',
    serverPresenceAway: 'Ausente',
    serverPresenceOffline: 'Offline',
  },
  ru: { ...SERVER_EN },
  de: {
    ...SERVER_EN,
    navServer: 'Messenger',
    serverSend: 'Senden',
    serverPresenceAvailable: 'Verfügbar',
    serverPresenceAway: 'Abwesend',
    serverPresenceOffline: 'Offline',
  },
  it: { ...SERVER_EN, serverSend: 'Invia' },
  ko: { ...SERVER_EN },
  ja: { ...SERVER_EN },
  th: { ...SERVER_EN },
  vi: { ...SERVER_EN },
  hi: { ...SERVER_EN },
  zh: {
    ...SERVER_EN,
    navServer: '信使',
    serverSend: '发送',
    serverPresenceAvailable: '在线',
    serverPresenceAway: '离开',
    serverPresenceOffline: '离线',
  },
  id: { ...SERVER_EN, serverSend: 'Kirim' },
  ar: { ...SERVER_EN, serverSend: 'إرسال' },
};

export function serverStringsFor(lang: string): Record<string, string> {
  const code = lang.split('-')[0];
  return BY_LANG[code] ?? SERVER_EN;
}

export function mergeServerStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, serverStringsFor(lang));
}
