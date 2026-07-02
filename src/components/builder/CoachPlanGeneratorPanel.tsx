'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePremium } from '@/hooks/usePremium';
import { getStoredEquipment } from '@/lib/equipmentPrefs';
import type { GeneratedCoachPlan, CoachPlanGoal } from '@/lib/coachPlanServer';
import type { CoachPlanEquipment } from '@/lib/coachPlanExercises';
import type { ProgramSession, ProgramTemplate } from '@/data/programTemplates';

interface Props {
  onLoadSession: (program: ProgramTemplate, session: ProgramSession) => void;
  onSaveAllSessions: (program: ProgramTemplate) => void;
}

function toProgramTemplate(plan: GeneratedCoachPlan): ProgramTemplate {
  return {
    id: plan.id,
    name: plan.name,
    category: 'pro',
    description: plan.description,
    duration: plan.duration,
    focus: plan.focus,
    sessions: plan.sessions,
  };
}

export function CoachPlanGeneratorPanel({ onLoadSession, onSaveAllSessions }: Props) {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [goal, setGoal] = useState<CoachPlanGoal>('general-strength');
  const [equipment, setEquipment] = useState<CoachPlanEquipment>(() => {
    const stored = getStoredEquipment();
    if (stored === 'dumbbells') return 'dumbbells';
    if (stored === 'gym' || stored === 'full') return 'gym';
    return 'bodyweight';
  });
  const [weeks, setWeeks] = useState<'2' | '3' | '4'>('4');
  const [sessionsPerWeek, setSessionsPerWeek] = useState<'2' | '3' | '4'>('3');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedCoachPlan | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    setPlan(null);

    try {
      const res = await fetch('/api/coach/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goal,
          equipment,
          weeks: Number(weeks),
          sessionsPerWeek: Number(sessionsPerWeek),
          readiness: 70,
          strain: 50,
          recovery: 55,
        }),
      });
      const data = (await res.json()) as { plan?: GeneratedCoachPlan; error?: string };
      if (!res.ok) {
        setError(data.error ?? t('coachPlanError', { defaultValue: 'Could not generate plan' }));
        return;
      }
      if (data.plan) setPlan(data.plan);
    } catch {
      setError(t('coachPlanNetworkError', { defaultValue: 'Network error — try again when online' }));
    } finally {
      setGenerating(false);
    }
  };

  const program = plan ? toProgramTemplate(plan) : null;

  return (
    <section
      id="train-coach"
      className="rounded-xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-card p-5 md:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          {t('coachPlanTitle', { defaultValue: 'Train Coach — AI plan generator' })}
        </h3>
        <Badge variant="secondary">
          {t('coachPlanPremiumBadge', { defaultValue: 'Super Bundle' })}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('coachPlanDesc', {
          defaultValue:
            'Premium adaptive programming from your goals and equipment. Free tier keeps rule-based daily insight and offline templates.',
        })}
      </p>

      {!premiumLoading && !premium && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          {t('coachPlanLocked', {
            defaultValue: 'AI plan generator requires Super Bundle premium.',
          })}{' '}
          <Link href="/bundle" className="text-emerald-400 underline font-medium">
            {t('coachPlanUnlock', { defaultValue: 'Unlock Super Bundle' })}
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('coachPlanGoal', { defaultValue: 'Goal' })}</Label>
          <Select value={goal} onValueChange={(v) => setGoal(v as CoachPlanGoal)} disabled={!premium}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general-strength">
                {t('coachPlanGoalStrength', { defaultValue: 'General strength' })}
              </SelectItem>
              <SelectItem value="muscle">
                {t('coachPlanGoalMuscle', { defaultValue: 'Muscle building' })}
              </SelectItem>
              <SelectItem value="fat-loss">
                {t('coachPlanGoalFatLoss', { defaultValue: 'Fat loss' })}
              </SelectItem>
              <SelectItem value="mobility">
                {t('coachPlanGoalMobility', { defaultValue: 'Mobility' })}
              </SelectItem>
              <SelectItem value="endurance">
                {t('coachPlanGoalEndurance', { defaultValue: 'Endurance' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('coachPlanEquipment', { defaultValue: 'Equipment' })}</Label>
          <Select
            value={equipment}
            onValueChange={(v) => setEquipment(v as CoachPlanEquipment)}
            disabled={!premium}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bodyweight">
                {t('coachPlanEquipBw', { defaultValue: 'Bodyweight only' })}
              </SelectItem>
              <SelectItem value="dumbbells">
                {t('coachPlanEquipDb', { defaultValue: 'Dumbbells' })}
              </SelectItem>
              <SelectItem value="gym">
                {t('coachPlanEquipGym', { defaultValue: 'Full gym' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('coachPlanWeeks', { defaultValue: 'Duration (weeks)' })}</Label>
          <Select value={weeks} onValueChange={(v) => setWeeks(v as '2' | '3' | '4')} disabled={!premium}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('coachPlanFrequency', { defaultValue: 'Sessions per week' })}</Label>
          <Select
            value={sessionsPerWeek}
            onValueChange={(v) => setSessionsPerWeek(v as '2' | '3' | '4')}
            disabled={!premium}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        className="w-full sm:w-auto"
        disabled={!premium || generating}
        onClick={() => void handleGenerate()}
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('coachPlanGenerating', { defaultValue: 'Generating plan…' })}
          </>
        ) : (
          t('coachPlanGenerateCta', { defaultValue: 'Generate my plan' })
        )}
      </Button>

      {error && (
        <p className="text-sm text-amber-400" role="alert">
          {error}
        </p>
      )}

      {program && plan && (
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {program.name}
              {plan.source === 'llm' && (
                <Badge className="text-[10px] bg-emerald-600/80">
                  {t('coachAiBadge', { defaultValue: 'AI' })}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{program.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{program.duration}</Badge>
              <Badge variant="muscle">{program.focus}</Badge>
              <Badge variant="secondary">
                {t('coachPlanSessionCount', {
                  count: program.sessions.length,
                  defaultValue: `${program.sessions.length} sessions`,
                })}
              </Badge>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {program.sessions.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <strong className="text-foreground">{s.name}</strong> — {s.exercises.length}{' '}
                  {t('coachPlanExercises', { defaultValue: 'exercises' })}
                </li>
              ))}
              {program.sessions.length > 6 && (
                <li>+{program.sessions.length - 6} more…</li>
              )}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLoadSession(program, program.sessions[0])}
              >
                {t('coachPlanLoadFirst', { defaultValue: 'Load first session' })}
              </Button>
              <Button size="sm" onClick={() => onSaveAllSessions(program)}>
                {t('coachPlanSaveAll', { defaultValue: 'Save all sessions' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
