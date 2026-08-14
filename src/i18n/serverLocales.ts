/** Mission Server / Garage strings — merged into i18n `common` namespace. */

const SERVER_EN: Record<string, string> = {
  navServer: 'Garage',
  moreServerDesc: 'Text rooms on this device',
  serverEyebrow: 'Garage',
  serverTitle: 'Garage',
  serverSubtitle: 'Text rooms on this device. Not a feed.',
  serverChannelTrain: 'train',
  serverChannelGarage: 'garage',
  serverChannelOffTopic: 'off-topic',
  serverEmpty: 'No messages yet. They stay on this device.',
  serverComposerPlaceholder: 'Message #{{channel}}',
  serverSend: 'Send',
  serverMemberSelf: 'You',
  serverMemberCount: '1 member',
  serverChannelsLabel: 'Channels',
  serverMembersLabel: 'Members',
  serverLocalNote: 'Saved on this device. Cloud fan-out only if you are signed in.',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: SERVER_EN,
  es: { ...SERVER_EN, navServer: 'Garaje', serverSend: 'Enviar', serverMemberSelf: 'Tú', serverEmpty: 'Aún no hay mensajes. Quedan en este dispositivo.' },
  fr: { ...SERVER_EN, navServer: 'Garage', serverSend: 'Envoyer', serverMemberSelf: 'Toi' },
  pt: { ...SERVER_EN, navServer: 'Garagem', serverSend: 'Enviar', serverMemberSelf: 'Você' },
  ru: { ...SERVER_EN },
  de: { ...SERVER_EN, serverSend: 'Senden' },
  it: { ...SERVER_EN, serverSend: 'Invia' },
  ko: { ...SERVER_EN },
  ja: { ...SERVER_EN },
  th: { ...SERVER_EN },
  vi: { ...SERVER_EN },
  hi: { ...SERVER_EN },
  zh: { ...SERVER_EN, navServer: '车库', serverSend: '发送' },
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
