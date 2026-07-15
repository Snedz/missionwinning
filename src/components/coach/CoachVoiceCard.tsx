'use client';
/**
 * Weekly voice briefing card.
 * See: src/components/coach/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CoachPlan } from '@/lib/coach/types';
import type { BodyScores } from '@/lib/score';

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

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    setLoading(true);
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
      }),
    })
      .then((r) => r.json())
      .then((data: VoiceResponse) => {
        if (!cancelled) setVoice(data);
      })
      .catch(() => {
        if (!cancelled) setVoice(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plan, bodyScores, premium]);

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
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90">{displayMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
