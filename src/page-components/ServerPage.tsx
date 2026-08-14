'use client';
/**
 * Page: /server — Mission Server v1 garage text rooms.
 * See: docs/MISSION_SERVER_V1_PLAN.md, app/INDEX.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChannelList } from '@/components/social/ChannelList';
import { MemberList } from '@/components/social/MemberList';
import { MessageComposer } from '@/components/social/MessageComposer';
import { MessageList } from '@/components/social/MessageList';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { ingestRemoteMessage, loadMissionServer, messagesForChannel, postLocalMessage } from '@/lib/social/store';
import { connectGarageRealtime, type GarageRealtimeHandle } from '@/lib/social/realtime';
import type { MissionServerState } from '@/lib/social/types';

export function ServerPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<MissionServerState | null>(null);
  const [channelId, setChannelId] = useState('train');
  const [realtime, setRealtime] = useState<GarageRealtimeHandle | null>(null);

  useEffect(() => {
    setState(loadMissionServer());
  }, []);

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

  const onSend = useCallback(
    (body: string) => {
      if (!channel) return;
      const result = postLocalMessage(channel.id, body);
      if (!result.ok) return;
      setState(result.state);
      if (realtime?.ok) void realtime.send(result.message);
    },
    [channel, realtime]
  );

  if (!state || !channel) {
    return (
      <div className="p-6">
        <PillarPageHeader
          icon={Hash}
          eyebrow={t('serverEyebrow', { defaultValue: 'Garage' })}
          title={t('serverTitle', { defaultValue: 'Garage' })}
          subtitle=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <PillarPageHeader
          icon={Hash}
          eyebrow={t('serverEyebrow', { defaultValue: 'Garage' })}
          title={t('serverTitle', { defaultValue: 'Garage' })}
          subtitle={t('serverSubtitle', { defaultValue: 'Text rooms on this device. Not a feed.' })}
        />
        <p className="shrink-0 pt-2 text-xs text-muted-foreground md:hidden">
          {t('serverMemberCount', { defaultValue: '1 member' })}
        </p>
      </div>

      <div className="grid min-h-[60vh] border-2 border-border md:grid-cols-[11rem_minmax(0,1fr)_9rem]">
        <div className="border-b-2 border-border p-2 md:border-b-0 md:border-r-2">
          <ChannelList
            channels={state.server.channels}
            activeId={channel.id}
            onSelect={setChannelId}
          />
        </div>
        <div className="flex min-h-[40vh] flex-col">
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} />
          </div>
          <MessageComposer channelName={channel.name} onSend={onSend} />
        </div>
        <div className="hidden border-l-2 border-border p-2 md:block">
          <MemberList />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('serverLocalNote', {
          defaultValue: 'Saved on this device. Cloud fan-out only if you are signed in.',
        })}
      </p>
    </div>
  );
}
