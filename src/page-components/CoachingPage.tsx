'use client';
/**
 * Page: /coaching — human 1:1 lead form (not Mission Coach).
 * Quiet leftover. Never a rail. See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { submitLead } from '@/lib/supabase';

export function CoachingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await submitLead({
      name,
      email,
      goals: message,
      package_interest: 'coaching-interest',
      source: 'coaching-page',
      message,
    });
    setLoading(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(
        t('infoCoachingError', {
          defaultValue: 'Could not submit right now. Try again or email support@missionwinning.com',
        })
      );
    }
  };

  if (submitted) {
    return (
      <InfoPageShell
        className="house-coaching"
        icon={Users}
        eyebrow={t('coachingEyebrow', { defaultValue: 'Coaching' })}
        title={t('infoCoachingReceived', { defaultValue: 'Received.' })}
        subtitle={t('infoCoachingThanks', {
          defaultValue:
            'Thanks — your note is with the founder, who reads every one. Replies come by email, and it is a one-person shop, so give it a few days.',
        })}
        variant="sections"
      >
        <div className="house-card space-y-4 text-center">
          <button
            type="button"
            className="house-btn house-btn-primary primary-action min-h-[52px] tap-target"
            onClick={() => router.push('/log')}
          >
            {t('infoBackToday', { defaultValue: 'Back to Today' })}
          </button>
        </div>
      </InfoPageShell>
    );
  }

  return (
    <InfoPageShell
      className="house-coaching"
      icon={Users}
      eyebrow={t('coachingEyebrow', { defaultValue: 'Coaching' })}
      title={t('infoCoachingTitle', { defaultValue: 'A coach in your corner' })}
      subtitle={t('infoCoachingSubtitleBrief', {
        defaultValue: 'Tell us your goals. No commitment, no payment today.',
      })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: form is the first-paint object. Never Mission Coach. */}
      <form className="house-card space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap-target min-h-[44px] px-4 py-3 text-sm"
            placeholder={t('infoCoachingName', { defaultValue: 'Name' })}
            aria-label={t('infoCoachingName', { defaultValue: 'Name' })}
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tap-target min-h-[44px] px-4 py-3 text-sm"
            placeholder={t('infoCoachingEmail', { defaultValue: 'Email' })}
            aria-label={t('infoCoachingEmail', { defaultValue: 'Email' })}
          />
        </div>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-32 w-full px-4 py-3 text-sm"
          placeholder={t('infoCoachingGoalsPlaceholder', {
            defaultValue: "Your goals, your current training, and what you'd want from a coach…",
          })}
          aria-label={t('infoCoachingGoalsLabel', { defaultValue: 'Your goals and current training' })}
        />
        {error ? <p className="text-sm font-semibold">{error}</p> : null}
        <button
          type="submit"
          className="house-btn house-btn-primary primary-action w-full min-h-[52px] tap-target"
          disabled={loading}
        >
          {loading
            ? t('infoCoachingSending', { defaultValue: 'Sending…' })
            : t('infoCoachingSubmit', { defaultValue: 'Join the coaching interest list' })}
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          {t('infoCoachingFoot', {
            defaultValue: "Free to join. We'll only email you about coaching.",
          })}
        </p>
      </form>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {t('infoCoachingDisclaimer', {
          defaultValue:
            'Coaching is education and accountability — results depend on your consistency and circumstances. Always clear new training or nutrition plans with your physician.',
        })}
      </p>
    </InfoPageShell>
  );
}
