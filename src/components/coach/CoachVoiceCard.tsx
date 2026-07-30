'use client';
/**
 * Weekly voice briefing card.
 * See: src/components/coach/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/ErrorState';
import type { CoachPlan } from '@/lib/coach/types';
import type { BodyScores } from '@/lib/score';
import { getOrCreateDeviceId } from '@/lib/coach/storage';

type VoiceResponse = {
  message: string;
  source: 'llm' | 'rules';
};

type Props = {
  plan: CoachPlan | null;
  bodyScores: BodyScores;
  premium: boolean;
};

export function CoachVoiceCard({ plan, bodyScores, premium }: Props) {
  const { t } = useTranslation();
  const [voice, setVoice] = useState<VoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = () => {
    if (!plan) return;
    setLoading(true);
    setError(false);
    void fetch('/api/coach/plan-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        plan: {
          weekStart: plan.weekStart,
          sessions: plan.sessions.map((s) => ({
            name: s.name,
            kind: s.kind,
            whyKeys: s.exercises.map((e) => e.whyKey),
          })),
        },
        readiness: bodyScores.readiness,
        strain: bodyScores.strain,
        recovery: bodyScores.recovery,
        premium,
        // Metering identity for anonymous athletes — counts, never content.
        deviceId: getOrCreateDeviceId(),
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('voice failed');
        return r.json() as Promise<VoiceResponse>;
      })
      .then((data) => {
        setVoice(data);
      })
      .catch(() => {
        setVoice(null);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!plan) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on plan identity
  }, [plan?.weekStart, plan?.revision, bodyScores.readiness, bodyScores.strain, bodyScores.recovery, premium]);

  if (!plan) return null;

  const displayMessage =
    voice?.source === 'rules' && voice.message.startsWith('coach')
      ? t(voice.message, { defaultValue: voice.message })
      : voice?.message;

  return (
    <Card className="content-card border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t('coachVoiceTitle', { defaultValue: "Commander's intent" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t('coachVoiceLoading', { defaultValue: 'Briefing your week…' })}
          </p>
        ) : error ? (
          <ErrorState
            title={t('coachVoiceError', { defaultValue: 'Could not load briefing' })}
            description={
              typeof navigator !== 'undefined' && !navigator.onLine
                ? t('coachVoiceOffline', {
                    defaultValue: 'You appear offline — try again when connected.',
                  })
                : t('coachVoiceErrorDesc', { defaultValue: 'Tap retry to load commander intent.' })
            }
            actionLabel={t('retry', { defaultValue: 'Retry' })}
            onAction={() => load()}
            className="py-6 border-0 bg-transparent"
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90">{displayMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
