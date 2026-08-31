'use client';
/**
 * Page: /account — settings leftover
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { supabase, signOut } from '@/lib/supabase';
import {
  clearAthleteLocalState,
  markExplicitSignOut,
} from '@/lib/storage/athleteLocalState';
import { formatOAuthError } from '@/lib/oauthConfig';
import { BetaAdminPanel } from '@/components/beta/BetaAdminPanel';
import { FounderStatusBoard } from '@/components/profile/FounderStatusBoard';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { showOwnerTools } from '@/lib/ownerTools';
import { useToast } from '@/hooks/use-toast';
import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { ProfileAccountCard } from '@/components/profile/ProfileAccountCard';
import { ProfilePregnancyCard } from '@/components/profile/ProfilePregnancyCard';
import { ProfileRemindersCard } from '@/components/profile/ProfileRemindersCard';
import { useMissionId } from '@/hooks/useMissionId';
import { ProfilePreferencesCard } from '@/components/profile/ProfilePreferencesCard';
import { ProfileOwnerTools } from '@/components/profile/ProfileOwnerTools';
import { ProfileBackupCard } from '@/components/profile/ProfileBackupCard';
import { ProfileImportCard } from '@/components/profile/ProfileImportCard';
import { readRaw, writeRaw, remove as removeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { cadenceHourPatch, readDayReviewHour } from '@/lib/dayReviewPrefs';
import { useWorkoutStore } from '@/store/workoutStore';
import { lastSessionAt } from '@/lib/reentry';

function readPushCadence() {
  return {
    lastSessionAt: lastSessionAt(useWorkoutStore.getState().workoutHistory),
    daysPerWeek: loadDaysPerWeek(),
    ...cadenceHourPatch(readDayReviewHour(readRaw(STORAGE_KEYS.dayReviewHour))),
  };
}

export function AccountPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const authErrorRaw = searchParams.get('authError');
  const authError = authErrorRaw ? formatOAuthError(authErrorRaw) : null;
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [goals, setGoals] = useState('Build strength and stay healthy');
  const [reminders, setReminders] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [dayReviewHour, setDayReviewHour] = useState<number | null>(null);
  const [importDeepLink, setImportDeepLink] = useState(false);
  const missionId = useMissionId();

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#import') return;
    setImportDeepLink(true);
    const id = requestAnimationFrame(() => {
      document.getElementById('import')?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      if (data.user?.id) {
        supabase
          .from('profiles')
          .select('reminders_opt_in')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setReminders(!!profile.reminders_opt_in);
          });
      }
    });
    const savedUnits = readRaw(STORAGE_KEYS.units) as 'metric' | 'imperial' | null;
    if (savedUnits) setUnits(savedUnits);
    const savedGoals = readRaw(STORAGE_KEYS.goals);
    if (savedGoals) setGoals(savedGoals);
    setDayReviewHour(readDayReviewHour(readRaw(STORAGE_KEYS.dayReviewHour)));

    void import('@/lib/pushClient').then(async (m) => {
      if (!m.isPushSupported()) return;
      setPushSupported(true);
      const on = await m.hasLocalPushSubscription();
      setPushOn(on);
      if (on) void m.syncPushSubscription(readPushCadence());
    });
  }, []);

  const toggleReminders = async () => {
    if (remindersBusy) return;
    setRemindersBusy(true);
    const next = !reminders;
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ reminders_opt_in: next })
        .eq('id', data.user.id);
      if (!error) setReminders(next);
      else
        toast({
          title: t('remindersUpdateFailed', { defaultValue: 'Could not update reminders' }),
          description: t('remindersUpdateFailedDesc', { defaultValue: 'Try again in a moment.' }),
          variant: 'destructive',
        });
    }
    setRemindersBusy(false);
  };

  const togglePush = async () => {
    setPushBusy(true);
    try {
      const m = await import('@/lib/pushClient');
      if (pushOn) {
        await m.unsubscribePush();
        setPushOn(false);
      } else {
        const r = await m.subscribePush(readPushCadence());
        setPushOn(r === 'ok');
        if (r !== 'ok') {
          toast({
            title: t('remindersPushFailed', {
              defaultValue: 'Could not enable device notifications',
            }),
            variant: 'destructive',
          });
        }
      }
    } finally {
      setPushBusy(false);
    }
  };

  const changeDayReviewHour = async (next: number | null) => {
    setPushBusy(true);
    const previous = dayReviewHour;
    setDayReviewHour(next);
    try {
      if (next === null) removeRaw(STORAGE_KEYS.dayReviewHour);
      else writeRaw(STORAGE_KEYS.dayReviewHour, String(next));

      const m = await import('@/lib/pushClient');
      const cadence = { ...readPushCadence(), dayReviewHour: next };
      const ok = (await m.hasLocalPushSubscription())
        ? await m.syncPushSubscription(cadence)
        : (await m.subscribePush(cadence)) === 'ok';

      if (!ok) {
        setDayReviewHour(previous);
        if (previous === null) removeRaw(STORAGE_KEYS.dayReviewHour);
        else writeRaw(STORAGE_KEYS.dayReviewHour, String(previous));
        toast({
          title: t('remindersDayReviewFailed', {
            defaultValue: 'Could not save the evening review time',
          }),
          variant: 'destructive',
        });
        return;
      }
      setPushOn(await m.hasLocalPushSubscription());
    } finally {
      setPushBusy(false);
    }
  };

  const saveUnits = (u: 'metric' | 'imperial') => {
    setUnits(u);
    writeRaw(STORAGE_KEYS.units, u);
    try {
      writeRaw(STORAGE_KEYS.unitsExplicit, '1');
    } catch {
      /* private mode */
    }
    scheduleJourneyPush();
  };

  const saveGoals = () => {
    writeRaw(STORAGE_KEYS.goals, goals);
    scheduleJourneyPush();
  };

  const handleSignOut = async () => {
    markExplicitSignOut();
    clearAthleteLocalState();
    await signOut();
    if (typeof window !== 'undefined') {
      window.location.assign('/');
      return;
    }
    router.push('/');
  };

  const ownerTools = showOwnerTools();

  return (
    <PillarPageShell
      className="house-account"
      icon={Settings}
      eyebrow={t('accountEyebrow', { defaultValue: 'Account' })}
      title={t('accountTitle', { defaultValue: 'Settings' })}
      subtitle={t('accountSubtitle', {
        defaultValue:
          'Sign-in, units, notifications and backup. Progress stays on this device unless you sign in.',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <ProfileAccountCard
        email={email}
        ownerTools={ownerTools}
        onSignOut={handleSignOut}
        authError={authError}
        missionId={missionId}
      />

      <ProfileRemindersCard
        signedIn={Boolean(email)}
        reminders={reminders}
        remindersBusy={remindersBusy}
        onToggleReminders={toggleReminders}
        pushSupported={pushSupported}
        pushOn={pushOn}
        pushBusy={pushBusy}
        onTogglePush={togglePush}
        dayReviewHour={dayReviewHour}
        onChangeDayReviewHour={changeDayReviewHour}
      />

      <ProfilePreferencesCard
        units={units}
        onSaveUnits={saveUnits}
        goals={goals}
        onGoalsChange={setGoals}
        onSaveGoals={saveGoals}
      />

      <details className="house-card group" open={importDeepLink}>
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          {t('accountMoreSettings', { defaultValue: 'More settings' })}
        </summary>
        <div className="space-y-6 border-t-2 border-border px-4 py-4">
          <ProfilePregnancyCard />
          <ProfileBackupCard />
          <div id="import" className="scroll-mt-4">
            <ProfileImportCard />
          </div>
        </div>
      </details>

      {ownerTools ? (
        <details className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            {t('accountOwnerSection', { defaultValue: 'Owner tools' })}
          </summary>
          <div className="space-y-6 border-t-2 border-border p-4">
            <FounderStatusBoard />
            <BetaAdminPanel enabled={!!email} />
            <ProfileOwnerTools />
          </div>
        </details>
      ) : null}
    </PillarPageShell>
  );
}
