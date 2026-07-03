'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
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
      setError('Could not submit right now. Try again or email support@missionwinning.com');
    }
  };

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={Users}
          title={t('infoCoachingTitle', { defaultValue: 'A coach in your corner' })}
          subtitle={t('infoCoachingSubtitle', {
            defaultValue:
              "We're building a small 1:1 coaching program on top of the free core. Tell us about your goals — no commitment, no payment today.",
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        {submitted ? (
          <div className="content-card p-8 text-center">
            <h2 className="font-display mb-2 text-2xl font-semibold uppercase">Received.</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Thanks — we read every note and reply personally, usually within 48 hours.
            </p>
            <Button variant="fitness" onClick={() => router.push('/log')}>
              Back to Today
            </Button>
          </div>
        ) : (
          <form className="content-card space-y-4 p-6 sm:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Name"
                aria-label="Name"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Email"
                aria-label="Email"
              />
            </div>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your goals, your current training, and what you'd want from a coach…"
              aria-label="Your goals and current training"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" size="lg" variant="fitness" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Join the coaching interest list'}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Free to join. We&apos;ll only email you about coaching.
            </p>
          </form>
        )}
      </StaggerItem>

      <StaggerItem index={2}>
        <p className="text-center text-xs leading-relaxed text-muted-foreground/80">
          Coaching is education and accountability — results depend on your consistency and
          circumstances. Always clear new training or nutrition plans with your physician.
        </p>
      </StaggerItem>

      <StaggerItem index={3}>
        <AppLegalFooter />
      </StaggerItem>
    </StaggerGroup>
  );
}
