'use client';
/**
 * Page: /server — Mission Server messenger (MSN rooms + presence).
 * See: docs/MISSION_SERVER_MESSENGER_PLAN.md, app/INDEX.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BuddyList } from '@/components/social/BuddyList';
import { ChatWindow } from '@/components/social/ChatWindow';
import { PresenceControl } from '@/components/social/PresenceControl';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import {
  ingestRemoteMessage,
  loadMissionServer,
  messagesForChannel,
  postLocalMessage,
  postLocalNudge,
  setLocalPresence,
} from '@/lib/social/store';
import { connectGarageRealtime, type GarageRealtimeHandle } from '@/lib/social/realtime';
import { pullChannelMessages, pullRemotePresence } from '@/lib/social/pull';
import { messageToPayload } from '@/lib/social/cloud';
import {
  enqueueSocialMessageIfSignedIn,
  enqueueSocialPresenceIfSignedIn,
  enqueueSocialReport,
} from '@/lib/socialSync';
import { readChatCallSign, readChatMissionId } from '@/lib/social/callSign';
import type { MissionServerState, PresenceStatus, RemotePresence } from '@/lib/social/types';

const CHANNEL_KEYS: Record<string, string> = {
  train: 'serverChannelTrain',
  garage: 'serverChannelGarage',
  'off-topic': 'serverChannelOffTopic',
};

export function ServerPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<MissionServerState | null>(null);
  const [channelId, setChannelId] = useState('train');
  const [realtime, setRealtime] = useState<GarageRealtimeHandle | null>(null);
  const [others, setOthers] = useState<RemotePresence[]>([]);

  useEffect(() => {
    setState(loadMissionServer());
  }, []);

  useEffect(() => {
    let active = true;
    void pullChannelMessages(channelId).then((remote) => {
      if (!active) return;
      let next = loadMissionServer();
      for (const message of remote) {
        const ingested = ingestRemoteMessage(message);
        if (ingested) next = ingested;
      }
      setState(next);
    });
    void pullRemotePresence().then((people) => {
      if (active) setOthers(people);
    });
    return () => {
      active = false;
    };
  }, [channelId]);

  useEffect(() => {
    let active = true;
    let handle: GarageRealtimeHandle | null = null;
    void connectGarageRealtime((payload) => {
      const next = ingestRemoteMessage(payload);
      if (next && active) setState(next);
    }).then((h) => {
      if (!active) {
        if (h.ok) h.disconnect();
        return;
      }
      handle = h;
      setRealtime(h);
    });
    return () => {
      active = false;
      if (handle?.ok) handle.disconnect();
    };
  }, []);

  const channel = useMemo(
    () => state?.server.channels.find((c) => c.id === channelId) ?? state?.server.channels[0],
    [state, channelId]
  );

  const messages = state && channel ? messagesForChannel(state, channel.id) : [];
  const displayName = readChatCallSign();
  const missionId = readChatMissionId();
  const roomName = channel
    ? t(CHANNEL_KEYS[channel.slug] ?? channel.name, { defaultValue: channel.name })
    : '';

  const onSend = useCallback(
    (body: string) => {
      if (!channel) return;
      const result = postLocalMessage(channel.id, body);
      if (!result.ok) return;
      setState(result.state);
      const payload = messageToPayload(result.message);
      if (payload) void enqueueSocialMessageIfSignedIn(payload);
      if (realtime?.ok) void realtime.send(result.message);
    },
    [channel, realtime]
  );

  const onNudge = useCallback(() => {
    if (!channel) return;
    const result = postLocalNudge(channel.id);
    if (!result.ok) return;
    setState(result.state);
    const payload = messageToPayload(result.message);
    if (payload) void enqueueSocialMessageIfSignedIn(payload);
    if (realtime?.ok) void realtime.send(result.message);
  }, [channel, realtime]);

  const onPresence = useCallback((next: PresenceStatus) => {
    const updated = setLocalPresence(next);
    setState(updated);
    void enqueueSocialPresenceIfSignedIn({
      status: next,
      callSign: readChatCallSign(),
    });
  }, []);

  const onReport = useCallback((messageId: string) => {
    enqueueSocialReport({ messageId, reason: 'other' });
  }, []);

  if (!state || !channel) {
    return (
      <div className="p-6">
        <PillarPageHeader
          icon={MessageSquare}
          eyebrow={t('serverEyebrow', { defaultValue: 'Mission Server' })}
          title={t('serverTitle', { defaultValue: 'Garage' })}
          subtitle=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PillarPageHeader
          icon={MessageSquare}
          eyebrow={t('serverEyebrow', { defaultValue: 'Mission Server' })}
          title={t('serverTitle', { defaultValue: 'Garage' })}
          subtitle={t('serverSubtitle', {
            defaultValue: 'Shared rooms when signed in. Guests stay on this device. Not a feed.',
          })}
        />
        <div className="shrink-0 md:pt-2">
          <p className="mb-2 text-sm font-semibold">
            {displayName}
            {missionId ? (
              <span className="ms-2 tabular-nums text-muted-foreground">{missionId}</span>
            ) : null}
          </p>
          <PresenceControl value={state.presence} onChange={onPresence} />
          {others.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {others.map((person) => (
                <li key={`${person.callSign}-${person.lastSeen}`}>
                  {person.callSign} · {person.status}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid min-h-[60vh] border-2 border-border md:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="border-b-2 border-border p-2 md:border-b-0 md:border-r-2">
          <BuddyList state={state} activeId={channel.id} onSelect={setChannelId} />
        </div>
        <ChatWindow
          roomName={roomName}
          messages={messages}
          onSend={onSend}
          onNudge={onNudge}
          onReport={onReport}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t('serverLocalNote', {
          defaultValue:
            'Guests: this device only. Signed in: shared Garage rooms. Coach never reads the chat.',
        })}
      </p>
    </div>
  );
}
