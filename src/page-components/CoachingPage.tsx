'use client';
/**
 * Page: /coaching — human coaching leads (not AI)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <InfoPageShell
      icon={Users}
      eyebrow={t('coachingEyebrow', { defaultValue: 'Coaching' })}
      title={t('infoCoachingTitle', { defaultValue: 'A coach in your corner' })}
      subtitle={t('infoCoachingSubtitle', {
        defaultValue:
          "We're building a small 1:1 coaching program on top of the free core. Tell us about your goals — no commitment, no payment today.",
      })}
      variant="sections"
      showLegalFooter
    >
      {submitted ? (
        <Card className="content-card">
          <CardContent className="p-8 text-center">
            <h2 className="font-display mb-2 text-2xl font-semibold uppercase">
              {t('infoCoachingReceived', { defaultValue: 'Received.' })}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('infoCoachingThanks', {
                defaultValue:
                  'Thanks — we read every note and reply personally, usually within 48 hours.',
              })}
            </p>
            <Button variant="fitness" onClick={() => router.push('/log')}>
              {t('infoBackToday', { defaultValue: 'Back to Today' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form className="content-card space-y-4 p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('infoCoachingName', { defaultValue: 'Name' })}
              aria-label={t('infoCoachingName', { defaultValue: 'Name' })}
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('infoCoachingEmail', { defaultValue: 'Email' })}
              aria-label={t('infoCoachingEmail', { defaultValue: 'Email' })}
            />
          </div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('infoCoachingGoalsPlaceholder', {
              defaultValue: "Your goals, your current training, and what you'd want from a coach…",
            })}
            aria-label={t('infoCoachingGoalsLabel', { defaultValue: 'Your goals and current training' })}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" size="lg" variant="fitness" className="w-full" disabled={loading}>
            {loading
              ? t('infoCoachingSending', { defaultValue: 'Sending…' })
              : t('infoCoachingSubmit', { defaultValue: 'Join the coaching interest list' })}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {t('infoCoachingFoot', {
              defaultValue: "Free to join. We'll only email you about coaching.",
            })}
          </p>
        </form>
      )}

      <p className="text-center text-xs leading-relaxed text-muted-foreground/80">
        {t('infoCoachingDisclaimer', {
          defaultValue:
            'Coaching is education and accountability — results depend on your consistency and circumstances. Always clear new training or nutrition plans with your physician.',
        })}
      </p>
    </InfoPageShell>
  );
}
