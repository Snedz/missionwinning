'use client';
/**
 * Page: /account — settings, notifications, billing, backup.
 *
 * This was `/profile` until `.606`. The route was named after a person and held
 * nothing of one: email, units, goals, push cadence, billing, backup. The single
 * identity block on it was the badge shelf. Splitting it gives the settings a
 * name that says what they are and frees `/profile` to become the Athlete Page
 * the nav label "You" has always claimed — docs/IDENTITY_SOCIAL_PLAN.md S2.
 *
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, signOut } from '@/lib/supabase';
import {
  clearAthleteLocalState,
  markExplicitSignOut,
} from '@/lib/storage/athleteLocalState';
import { formatOAuthError } from '@/lib/oauthConfig';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { daysSinceCommission } from '@/lib/missionJourney';
import { getBetaFunnelMetrics } from '@/lib/journeyAnalytics';
import { BetaAdminPanel } from '@/components/beta/BetaAdminPanel';
import { FounderStatusBoard } from '@/components/profile/FounderStatusBoard';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { LegalNav } from '@/components/layout/LegalNav';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { showOwnerTools } from '@/lib/ownerTools';
import { useToast } from '@/hooks/use-toast';
import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { openBillingPortal } from '@/lib/payments';
import { ProfileAccountCard } from '@/components/profile/ProfileAccountCard';
import { ProfileTransparencyCard } from '@/components/profile/ProfileTransparencyCard';
import { ProfilePregnancyCard } from '@/components/profile/ProfilePregnancyCard';
import { ProfileRemindersCard } from '@/components/profile/ProfileRemindersCard';
import { useMissionId } from '@/hooks/useMissionId';
import { ProfilePreferencesCard } from '@/components/profile/ProfilePreferencesCard';
import { HomeGymKitCard } from '@/components/profile/HomeGymKitCard';
import { ProfileAssessmentCard } from '@/components/profile/ProfileAssessmentCard';
import { ProfileBetaJourneyCard } from '@/components/profile/ProfileBetaJourneyCard';
import { ProfileJourneyCard } from '@/components/profile/ProfileJourneyCard';
import { ProfilePremiumCard } from '@/components/profile/ProfilePremiumCard';
import { ProfileOwnerTools } from '@/components/profile/ProfileOwnerTools';
import { ProfileBackupCard } from '@/components/profile/ProfileBackupCard';
import { ProfileImportCard } from '@/components/profile/ProfileImportCard';
import { SyncStatusRow } from '@/components/profile/SyncStatusRow';
import { ProfilePrivacyCard } from '@/components/profile/ProfilePrivacyCard';
import { ProfileFeedbackCard } from '@/components/profile/ProfileFeedbackCard';
import { ProfileWhatsNewCard } from '@/components/profile/ProfileWhatsNewCard';
import { ProfileReferralCard } from '@/components/profile/ProfileReferralCard';
import { ProfileWearablesCard } from '@/components/profile/ProfileWearablesCard';
import { readRaw, writeRaw, remove as removeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { cadenceHourPatch, readDayReviewHour } from '@/lib/dayReviewPrefs';
import { useWorkoutStore } from '@/store/workoutStore';
import { lastSessionAt } from '@/lib/reentry';

/**
 * Cadence for the push row — read imperatively so the value is always current and
 * the mount effect keeps an empty dependency list. Deliberately narrow: the server
 * learns when the athlete last trained, how often they aim to, and the hour they
 * chose for the evening review — and nothing about what they actually did.
 *
 * `.196` added the hour. Leaving it out is what made `day_review_hour` NULL for
 * every athlete who already had push: the only writer was an opt-in card that
 * skipped itself in exactly that case, and no other sync carried the field. Note
 * the field is only included when the device actually has a stored hour —
 * `buildSubscriptionRow` omits `undefined`, so a cadence sync from a device that
 * has never chosen one can never clear a hour chosen elsewhere.
 */
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
  const { isCommissioned, state, action } = useMissionJourney();
  const [email, setEmail] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [goals, setGoals] = useState('Build strength and stay healthy');
  const [premium, setPremium] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [dayReviewHour, setDayReviewHour] = useState<number | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  /**
   * `#import` deep link. Read in an effect, not during render: the fragment is
   * not sent to the server, so deciding `open` from it while hydrating would be a
   * mismatch. One frame closed, then open and scrolled, beats a hydration error.
   */
  const [importDeepLink, setImportDeepLink] = useState(false);
  const missionId = useMissionId();

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#import') return;
    setImportDeepLink(true);
    // After the details paints open, put the card on screen.
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

    import('@/lib/supabase').then(({ isPremium }) => {
      isPremium().then(setPremium);
    });
    void import('@/lib/pushClient').then(async (m) => {
      if (!m.isPushSupported()) return;
      setPushSupported(true);
      const on = await m.hasLocalPushSubscription();
      setPushOn(on);
      // Re-post silently when one already exists: heals a row lost to a failed POST,
      // and attaches user_id to a subscription first made signed-out, so nobody is
      // asked to opt in twice for the same device. Never prompts.
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

  /**
   * Choosing an hour is how the evening review is turned on, so this subscribes
   * when the device has no subscription yet rather than requiring the athlete to
   * flip device notifications first and then find this row. Turning it off sends
   * an explicit `null` — the one place the field must reach the column as NULL
   * instead of being omitted, or the note keeps arriving after they said stop.
   */
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
        // Put the device back where it was: a stored hour the server never
        // learned about would show the athlete a setting that does nothing.
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

  const handleManageBilling = async () => {
    setBillingBusy(true);
    const result = await openBillingPortal();
    setBillingBusy(false);
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    toast({
      title: t('billingPortalError', { defaultValue: 'Billing portal' }),
      description:
        result.code === 'auth_required'
          ? t('billingPortalSignIn', { defaultValue: 'Sign in to manage billing.' })
          : result.message,
      variant: 'destructive',
    });
  };

  const handleEmailNudge = async () => {
    setNudgeLoading(true);
    setNudgeSent(false);
    try {
      const res = await fetch('/api/journey/nudge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: action.label,
          description: action.description,
          href: action.href,
          stepLabel: action.stepLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send email');
      setNudgeSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email not available';
      toast({
        title: t('emailNextStepFailed', { defaultValue: 'Could not send email' }),
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setNudgeLoading(false);
    }
  };

  const [experience] = useState(() =>
    typeof window !== 'undefined' ? readRaw(STORAGE_KEYS.experience) || '' : ''
  );
  const [equipment] = useState(() =>
    typeof window !== 'undefined' ? readRaw(STORAGE_KEYS.equipment) || '' : ''
  );
  const [daysPerWeek, setDaysPerWeek] = useState(() =>
    loadDaysPerWeek(
      typeof window !== 'undefined' ? readRaw(STORAGE_KEYS.experience) || 'beginner' : 'beginner'
    )
  );
  const [primaryGoal] = useState(() =>
    typeof window !== 'undefined' ? readRaw(STORAGE_KEYS.primaryGoal) || goals : goals
  );

  const isOnboarded = !!(experience && equipment);
  const funnel = getBetaFunnelMetrics(state);
  const ownerTools = showOwnerTools();

  return (
    /*
     * Field manual on Account: day-one stack stays open (sign-in · return channel ·
     * prefs). Secondary cards collapse under "More settings" so the page is a
     * utility briefing, not a card wall. Owner tools stay reachably grouped.
     * Red-action rules on this route are unchanged (magic-link / billing own red).
     */
    <PillarPageShell
      icon={Settings}
      eyebrow={t('accountEyebrow', { defaultValue: 'Account' })}
      title={t('accountTitle', { defaultValue: 'Settings' })}
      subtitle={
        isCommissioned && state.commissionedAt
          ? t('profileCommissionedDay', {
              day: daysSinceCommission(state.commissionedAt),
              defaultValue: `Day ${daysSinceCommission(state.commissionedAt)} on the path`,
            })
          : t('accountSubtitle', {
              defaultValue:
                'Sign-in, units, notifications and backup. Progress stays on this device unless you sign in.',
            })
      }
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p className="eyebrow text-primary -mt-2">
        {t('accountPrimaryHint', { defaultValue: 'What you need day to day' })}
      </p>

      <p className="eyebrow">Account</p>
      <ProfileAccountCard
        email={email}
        ownerTools={ownerTools}
        onSignOut={handleSignOut}
        authError={authError}
        missionId={missionId}
      />

      <ProfileTransparencyCard />

      {/* Not behind `email &&` — device notifications are the only return channel an
          anonymous athlete has, and they are the athlete this product is built for.
          The card renders nothing when it has neither row to offer. */}
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

      <p className="eyebrow">Units</p>
      <ProfilePreferencesCard
        units={units}
        onSaveUnits={saveUnits}
        goals={goals}
        onGoalsChange={setGoals}
        onSaveGoals={saveGoals}
      />

      <HomeGymKitCard />

      {/* Reachable without expanding: referral invite, feedback, privacy, backup
          (e2e + product promise). Everything else folds under More settings. */}
      <ProfileReferralCard signedIn={Boolean(email)} />

      <ProfileFeedbackCard />

      <Card className="border-2 border-border bg-card">
        <CardContent className="space-y-2 pt-6">
          <p className="font-semibold">
            {t('accountExploreTitle', { defaultValue: 'Explore places' })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('accountExploreLead', {
              defaultValue: 'A quiet map of pins you have tagged. GPS is optional.',
            })}
          </p>
          <Link
            href="/explore"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('accountExploreCta', { defaultValue: 'Open Explore' })}
          </Link>
        </CardContent>
      </Card>

      <ProfilePremiumCard
        premium={premium}
        billingBusy={billingBusy}
        onManageBilling={handleManageBilling}
      />

      {/*
       * `.766` — `#import` opens this and scrolls to the CSV card.
       *
       * set-table import has existed and shipped for a while, and it was
       * unreachable in practice: `/account` → expand "More settings" → scroll
       * past six cards. The East Asia shard lists data-in as its own P1 next to
       * logging speed, and a migrant arriving with a CSV in hand had no path.
       * I-Day and the Active empty state now link straight here.
       */}
      <details className="group border-2 border-border bg-card" open={importDeepLink}>
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          {t('accountMoreSettings', { defaultValue: 'More settings' })}
        </summary>
        <div className="space-y-6 border-t-2 border-border px-4 py-4">
          <ProfilePregnancyCard />

          <ProfileAssessmentCard />

          <ProfileBetaJourneyCard
            funnel={funnel}
            email={email}
            isCommissioned={isCommissioned}
            nudgeLoading={nudgeLoading}
            nudgeSent={nudgeSent}
            onEmailNudge={handleEmailNudge}
          />

          <ProfileJourneyCard
            isOnboarded={isOnboarded}
            experience={experience}
            equipment={equipment}
            primaryGoal={primaryGoal}
            goals={goals}
            daysPerWeek={daysPerWeek}
            onDaysPerWeekChange={setDaysPerWeek}
          />

          <ProfileWearablesCard signedIn={Boolean(email)} />

          <ProfileWhatsNewCard />

          <p className="eyebrow">Privacy</p>
          <ProfilePrivacyCard />

          <SyncStatusRow />

          <ProfileBackupCard />

          <p className="eyebrow">Export</p>
          <div id="import" className="scroll-mt-4">
            <ProfileImportCard />
          </div>
        </div>
      </details>

      {ownerTools ? (
        <details className="group border-2 border-border bg-card">
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

      <Card className="border-2 border-border bg-card">
        <CardContent className="pt-6">
          <p className="eyebrow mb-3 text-muted-foreground">
            {t('infoProfileHelpTitle', { defaultValue: 'Help & legal' })}
          </p>
          <LegalNav />
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}
