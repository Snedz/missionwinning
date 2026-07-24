'use client';
/**
 * Page: /feedback — user feedback form
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { submitLead } from '@/lib/supabase';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

export function FeedbackPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    results: '',
    testimonial: '',
    rating: '5',
    massiveAction: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const entry = { ...form, at: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('mw_beta_feedback') || '[]');
    localStorage.setItem('mw_beta_feedback', JSON.stringify([...existing, entry]));
    await submitLead({
      name: form.name || 'Beta Contributor',
      email: form.email,
      goals: `Results: ${form.results}\nTestimonial: ${form.testimonial}\nRating: ${form.rating}\nMassive action: ${form.massiveAction}`,
      package_interest: 'beta-feedback',
      source: 'feedback-page',
      message: form.testimonial,
    });
    localStorage.setItem('mw_beta_contributor', 'true');
    localStorage.setItem('mw_event_feedback', Date.now().toString());
    const claimed = parseInt(localStorage.getItem('mw_beta_spots_claimed') || '347');
    localStorage.setItem('mw_beta_spots_claimed', Math.min(500, claimed + 1).toString());
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <InfoPageShell
        icon={MessageSquare}
        title={t('infoFeedbackThankTitle', { defaultValue: 'Thank you' })}
        subtitle={t('infoFeedbackThankSubtitle', {
          defaultValue: 'Thanks — your notes help us improve the free logger and Coach.',
        })}
        variant="sections"
      >
        <Card className="border-border/50 bg-card/80 shadow-sm text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-muted/40 text-foreground text-sm border border-border/50">
                {t('feedbackThankBadge', { defaultValue: 'Thanks' })}
              </div>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm leading-relaxed">
                <p className="font-medium">{t('feedbackThankRoadmap', { defaultValue: '✓ Your input shapes what we build next' })}</p>
                <p className="font-medium">{t('feedbackThankEarly', { defaultValue: '✓ We’ll email when something useful ships' })}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  {t('feedbackThankEmail', { defaultValue: 'Check your inbox if you left an email.' })}
                </p>
              </div>
              <Button size="lg" variant="fitness" onClick={() => router.push('/log')}>
                {t('feedbackBackToday', { defaultValue: 'Back to Today' })}
              </Button>
            </CardContent>
          </Card>
      </InfoPageShell>
    );
  }

  return (
    <InfoPageShell
      icon={MessageSquare}
      title={t('infoFeedbackTitle', { defaultValue: 'Feedback' })}
      subtitle={t('infoFeedbackSubtitle', {
        defaultValue:
          'What worked, what didn’t, and what you want next. We read every note.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="border-border/50 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t('infoFeedbackFormTitle', { defaultValue: 'Tell us how it’s going' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('feedbackNameLabel', { defaultValue: 'Full name (optional)' })}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('feedbackNamePlaceholder', { defaultValue: 'Alex Rivera' })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('feedbackEmailLabel', { defaultValue: 'Email (for follow-up)' })}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('feedbackEmailPlaceholder', { defaultValue: 'you@winning.com' })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>{t('feedbackResultsLabel', { defaultValue: 'Key results so far' })}</Label>
                <textarea
                  className="mt-1 w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.results}
                  onChange={(e) => setForm({ ...form, results: e.target.value })}
                  placeholder={t('feedbackResultsPlaceholder', {
                    defaultValue: 'Added 25kg to squat in 6 weeks. Energy through the roof.',
                  })}
                  required
                />
              </div>

              <div>
                <Label>{t('feedbackTestimonialLabel', { defaultValue: 'Your testimonial' })}</Label>
                <textarea
                  className="mt-1 w-full h-28 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.testimonial}
                  onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  placeholder={t('feedbackTestimonialPlaceholder', {
                    defaultValue: 'Stop waiting. The free tracker alone got me consistent...',
                  })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('feedbackRatingLabel', { defaultValue: 'Rate your results (1–5)' })}</Label>
                  <div className="flex gap-2 mt-2">
                    {['1', '2', '3', '4', '5'].map((r) => (
                      <Button
                        key={r}
                        type="button"
                        size="sm"
                        variant={form.rating === r ? 'default' : 'outline'}
                        onClick={() => setForm({ ...form, rating: r })}
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{t('feedbackActionLabel', { defaultValue: 'Biggest action you took' })}</Label>
                  <Input
                    value={form.massiveAction}
                    onChange={(e) => setForm({ ...form, massiveAction: e.target.value })}
                    placeholder={t('feedbackActionPlaceholder', {
                      defaultValue: 'Finally ran the 5x5 program start to finish.',
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" variant="fitness" className="w-full" disabled={loading}>
                {loading
                  ? t('feedbackSubmitting', { defaultValue: 'Submitting…' })
                  : t('feedbackSubmit', { defaultValue: 'Submit feedback' })}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                {t('feedbackFootnote', {
                  defaultValue: 'Your words may be featured (anonymized or with permission).',
                })}
              </p>
            </form>
          </CardContent>
        </Card>

      <SignInPrompt
        nextPath="/feedback"
        description={t('feedbackSignInDesc', {
          defaultValue: 'Sign in to link feedback to your journey and sync across devices.',
        })}
      />
    </InfoPageShell>
  );
}
