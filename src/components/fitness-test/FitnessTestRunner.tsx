'use client';
/**
 * Presidential Fitness Test runner flow.
 * See: src/components/fitness-test/INDEX.md
 */

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YouthParentGate } from '@/components/fitness-test/YouthParentGate';
import { ShareFitnessButton } from '@/components/fitness-test/ShareFitnessButton';
import {
  awardLabel,
  formatMileTime,
  parseMileTime,
  PFT_EVENTS,
  PFT_MINI_EVENT_IDS,
  scoreFitnessTestSession,
  type FitnessEventId,
  type FitnessSex,
} from '@/lib/presidentialFitnessTest';
import { saveFitnessTestSession } from '@/lib/presidentialFitnessStorage';
import { joinClass, getJoinedClassCode } from '@/lib/schoolClass';
import { buildPftShareText } from '@/lib/shareFitnessMission';
import { hasYouthConsent, mergeYouthConsentFromServer, requiresYouthConsent } from '@/lib/youthConsent';
import { pushLeaderboardSnapshot } from '@/lib/leaderboardSync';
import { computeLocalLeaderboardSnapshot } from '@/lib/leaderboard/computeLocalStats';
import { useWorkoutStore } from '@/store/workoutStore';
import { americaHomeOrFallback, isAmericaTrackEnabled } from '@/lib/americaConfig';

type Step = 'profile' | 'youth' | 'events' | 'results';

export function FitnessTestRunner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMini = searchParams.get('mode') === 'mini';

  const eventIds = useMemo(
    () => (isMini ? PFT_MINI_EVENT_IDS : PFT_EVENTS.map((e) => e.id)),
    [isMini]
  );

  const [step, setStep] = useState<Step>('profile');
  const [age, setAge] = useState('14');
  const [sex, setSex] = useState<FitnessSex>('male');
  const [values, setValues] = useState<Record<string, string>>({});
  const [session, setSession] = useState<ReturnType<typeof scoreFitnessTestSession> | null>(null);
  const [youthConsented, setYouthConsented] = useState(false);
  const [classRank, setClassRank] = useState<{ rank: number; total: number; code: string } | null>(
    null
  );

  useEffect(() => {
    setYouthConsented(hasYouthConsent());
    void mergeYouthConsentFromServer().then(setYouthConsented);
  }, []);

  useEffect(() => {
    const classParam = searchParams.get('class');
    if (classParam) joinClass(classParam);
  }, [searchParams]);

  const ageNum = parseInt(age, 10);

  const proceedFromProfile = () => {
    if (!Number.isFinite(ageNum) || ageNum < 6) return;
    if (requiresYouthConsent(ageNum) && !youthConsented) {
      setStep('youth');
    } else {
      setStep('events');
    }
  };

  const handleScore = () => {
    if (!Number.isFinite(ageNum) || ageNum < 6) return;
    if (requiresYouthConsent(ageNum) && !youthConsented) {
      setStep('youth');
      return;
    }

    const results = eventIds
      .map((id) => {
        const raw = values[id]?.trim();
        if (!raw) return null;
        let value: number | null = null;
        if (id === 'mile_run') value = parseMileTime(raw);
        else value = parseFloat(raw);
        if (value == null || !Number.isFinite(value)) return null;
        return { eventId: id as FitnessEventId, value };
      })
      .filter(Boolean) as { eventId: FitnessEventId; value: number }[];

    if (results.length === 0) return;

    const scored = scoreFitnessTestSession({
      age: ageNum,
      sex,
      results,
      mode: isMini ? 'mini' : 'full',
    });
    saveFitnessTestSession(scored);
    const store = useWorkoutStore.getState();
    void pushLeaderboardSnapshot(
      computeLocalLeaderboardSnapshot(store.workoutHistory, store.savedWorkouts.length)
    );
    setSession(scored);
    setStep('results');
    const classCode = getJoinedClassCode();
    if (classCode) {
      setClassRank(null);
    } else {
      setClassRank(null);
    }
  };

  const inputForEvent = (eventId: FitnessEventId) => {
    const ev = PFT_EVENTS.find((e) => e.id === eventId);
    if (!ev) return null;
    const placeholder =
      eventId === 'mile_run'
        ? t('pftMilePlaceholder', { defaultValue: '6:30 or 390' })
        : t('pftRepsPlaceholder', { defaultValue: 'Enter result' });

    return (
      <label key={eventId} className="block space-y-1 text-sm">
        <span className="font-medium">{ev.name}</span>
        <span className="block text-xs text-muted-foreground">{ev.description}</span>
        <input
          type="text"
          inputMode={eventId === 'mile_run' ? 'text' : 'decimal'}
          value={values[eventId] ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, [eventId]: e.target.value }))}
          className="w-full min-h-[44px] rounded-none bg-background border border-border px-3 py-2"
          placeholder={placeholder}
        />
      </label>
    );
  };

  if (step === 'results' && session) {
    const shareText = buildPftShareText(session, getJoinedClassCode());
    return (
      <Card className="content-card max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>
            {t('pftResultsTitle', { defaultValue: 'Your fitness test results' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-border bg-card px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {t('pftOverallAward', { defaultValue: 'Overall award' })}
            </p>
            <p className="text-2xl font-bold text-muted-foreground mt-1">
              {awardLabel(session.overallTier)}
            </p>
          </div>
          {classRank && (
            <div className="border-2 border-primary bg-tint px-4 py-3 text-center text-sm">
              <p className="text-primary font-medium">
                {t('pftClassRank', {
                  defaultValue: '#{{rank}} in class {{code}}',
                  rank: classRank.rank,
                  code: classRank.code,
                })}
              </p>
              <Button
                variant="link"
                className="text-xs text-primary p-0 h-auto mt-1 min-h-[44px] tap-target"
                onClick={() =>
                  router.push(
                    `/leaderboard?board=presidential-fitness&scope=class&class=${classRank.code}`
                  )
                }
              >
                {t('pftViewClassBoard', { defaultValue: 'View class standings' })}
              </Button>
            </div>
          )}
          <ul className="space-y-2 text-sm">
            {session.events.map((ev) => (
              <li
                key={ev.eventId}
                className="flex justify-between gap-4 border-b-2 border-border pb-2"
              >
                <span>{ev.eventName}</span>
                <span className="text-muted-foreground shrink-0">
                  {ev.eventId === 'mile_run' ? formatMileTime(ev.value) : ev.value} ·{' '}
                  {awardLabel(ev.tier)}
                </span>
              </li>
            ))}
          </ul>
          <ShareFitnessButton
            text={shareText}
            className="w-full min-h-[44px] tap-target"
            labelKey="pftShareResult"
            defaultLabel="Share my results"
          />
          <Button className="w-full min-h-[44px] tap-target"
            onClick={() => router.push('/benchmarks')}
          >
            {t('pftBackBenchmarks', { defaultValue: 'Back to Benchmarks' })}
          </Button>
          {isAmericaTrackEnabled() && (
            <Button
              variant="outline"
              className="w-full min-h-[44px] tap-target"
              onClick={() => router.push(americaHomeOrFallback())}
            >
              {t('pftShareAmerica', { defaultValue: 'National fitness mission' })}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="content-card max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {isMini
            ? t('pftMiniTitle', { defaultValue: 'Mini fitness test' })
            : t('pftFullTitle', { defaultValue: 'Presidential Fitness Test' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'profile' && (
          <>
            <p className="text-sm text-muted-foreground">
              {t('pftProfileHint', {
                defaultValue:
                  'Age and sex select scoring bands inspired by classic youth fitness standards.',
              })}
            </p>
            <label className="block space-y-1 text-sm">
              <span>{t('pftAge', { defaultValue: 'Age' })}</span>
              <input
                type="number"
                min={6}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full min-h-[44px] rounded-none bg-background border border-border px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>{t('pftSex', { defaultValue: 'Scoring group' })}</span>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as FitnessSex)}
                className="w-full min-h-[44px] rounded-none bg-background border border-border px-3 py-2"
              >
                <option value="male">{t('pftSexMale', { defaultValue: 'Male standards' })}</option>
                <option value="female">
                  {t('pftSexFemale', { defaultValue: 'Female standards' })}
                </option>
              </select>
            </label>
            <Button className="w-full min-h-[44px] tap-target" onClick={proceedFromProfile}>
              {t('pftContinue', { defaultValue: 'Continue to events' })}
            </Button>
          </>
        )}

        {step === 'youth' && (
          <YouthParentGate
            childAge={ageNum}
            onConsented={() => {
              setYouthConsented(true);
              setStep('events');
            }}
            onCancel={() => setStep('profile')}
          />
        )}

        {step === 'events' && (
          <>
            {eventIds.map((id) => inputForEvent(id))}
            <Button className="w-full bg-[hsl(var(--status-info))] hover:bg-card" onClick={handleScore}>
              {t('pftScore', { defaultValue: 'Score my test' })}
            </Button>
            <Button variant="ghost" className="w-full min-h-[44px] tap-target" onClick={() => setStep('profile')}>
              {t('pftBack', { defaultValue: 'Back' })}
            </Button>
          </>
        )}

        <p className="text-[10px] text-muted-foreground">
          {t('pftDisclaimer', {
            defaultValue:
              'Educational fitness tool by Mission Winning LLC — not an official U.S. government test or endorsement.',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
