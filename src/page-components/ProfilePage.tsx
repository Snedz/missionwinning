'use client';
/**
 * Page: /profile — account, settings, backup
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, signOut } from '@/lib/supabase';
import { formatOAuthError } from '@/lib/oauthConfig';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { daysSinceCommission } from '@/lib/missionJourney';
import { getBetaFunnelMetrics } from '@/lib/journeyAnalytics';
import { BetaAdminPanel } from '@/components/beta/BetaAdminPanel';
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
import { ProfileRemindersCard } from '@/components/profile/ProfileRemindersCard';
import { ProfilePreferencesCard } from '@/components/profile/ProfilePreferencesCard';
import { ProfileAssessmentCard } from '@/components/profile/ProfileAssessmentCard';
import { ProfileBetaJourneyCard } from '@/components/profile/ProfileBetaJourneyCard';
import { ProfileJourneyCard } from '@/components/profile/ProfileJourneyCard';
import { ProfilePremiumCard } from '@/components/profile/ProfilePremiumCard';
import { ProfileOwnerTools } from '@/components/profile/ProfileOwnerTools';
import { ProfileBackupCard } from '@/components/profile/ProfileBackupCard';
import { ProfilePrivacyCard } from '@/components/profile/ProfilePrivacyCard';
import { ProfileReferralCard } from '@/components/profile/ProfileReferralCard';
import { ProfileWearablesCard } from '@/components/profile/ProfileWearablesCard';

export function ProfilePage() {
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
  const [billingBusy, setBillingBusy] = useState(false);

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
    const savedUnits = localStorage.getItem('mw_units') as 'metric' | 'imperial' | null;
    if (savedUnits) setUnits(savedUnits);
    const savedGoals = localStorage.getItem('mw_goals');
    if (savedGoals) setGoals(savedGoals);

    import('@/lib/supabase').then(({ isPremium }) => {
      isPremium().then(setPremium);
    });
    void import('@/lib/pushClient').then(async (m) => {
      if (!m.isPushSupported()) return;
      setPushSupported(true);
      setPushOn(await m.hasLocalPushSubscription());
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
        const r = await m.subscribePush();
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

  const saveUnits = (u: 'metric' | 'imperial') => {
    setUnits(u);
    localStorage.setItem('mw_units', u);
    scheduleJourneyPush();
  };

  const saveGoals = () => {
    localStorage.setItem('mw_goals', goals);
    scheduleJourneyPush();
  };

  const handleSignOut = async () => {
    await signOut();
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
    typeof window !== 'undefined' ? localStorage.getItem('mw_experience') || '' : ''
  );
  const [equipment] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('mw_equipment') || '' : ''
  );
  const [daysPerWeek, setDaysPerWeek] = useState(() =>
    loadDaysPerWeek(
      typeof window !== 'undefined' ? localStorage.getItem('mw_experience') || 'beginner' : 'beginner'
    )
  );
  const [primaryGoal] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('mw_primary_goal') || goals : goals
  );

  const isOnboarded = !!(experience && equipment);
  const funnel = getBetaFunnelMetrics(state);
  const ownerTools = showOwnerTools();

  return (
    <PillarPageShell
      icon={User}
      eyebrow={t('profileEyebrow', { defaultValue: 'You' })}
      title={t('profileSettings', { defaultValue: 'Profile & Settings' })}
      subtitle={
        isCommissioned && state.commissionedAt
          ? `${t('missionOperator', { defaultValue: 'Mission Operator' })} · Day ${daysSinceCommission(state.commissionedAt)}`
          : t('profileSubtitle', {
              defaultValue: 'Your Mission Winning account. Global preferences. Premium status.',
            })
      }
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <ProfileAccountCard
        email={email}
        ownerTools={ownerTools}
        onSignOut={handleSignOut}
        authError={authError}
      />

      {email && (
        <ProfileRemindersCard
          reminders={reminders}
          remindersBusy={remindersBusy}
          onToggleReminders={toggleReminders}
          pushSupported={pushSupported}
          pushOn={pushOn}
          pushBusy={pushBusy}
          onTogglePush={togglePush}
        />
      )}

      <ProfilePreferencesCard
        units={units}
        onSaveUnits={saveUnits}
        goals={goals}
        onGoalsChange={setGoals}
        onSaveGoals={saveGoals}
      />

      <ProfileAssessmentCard />

      <ProfileBetaJourneyCard
        funnel={funnel}
        email={email}
        isCommissioned={isCommissioned}
        nudgeLoading={nudgeLoading}
        nudgeSent={nudgeSent}
        onEmailNudge={handleEmailNudge}
      />

      {ownerTools && <BetaAdminPanel enabled={!!email} />}

      <ProfileJourneyCard
        isOnboarded={isOnboarded}
        experience={experience}
        equipment={equipment}
        primaryGoal={primaryGoal}
        goals={goals}
        daysPerWeek={daysPerWeek}
        onDaysPerWeekChange={setDaysPerWeek}
      />

      <ProfilePremiumCard
        premium={premium}
        billingBusy={billingBusy}
        onManageBilling={handleManageBilling}
      />

      {ownerTools && <ProfileOwnerTools />}

      <ProfileReferralCard signedIn={Boolean(email)} />

      <ProfileWearablesCard signedIn={Boolean(email)} />

      <ProfilePrivacyCard />

      <ProfileBackupCard />

      <Card>
        <CardContent className="pt-6">
          <p className="eyebrow mb-3">
            {t('infoProfileHelpTitle', { defaultValue: 'Help & legal' })}
          </p>
          <LegalNav />
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}
