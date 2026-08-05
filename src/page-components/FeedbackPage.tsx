'use client';
/**
 * Page: /feedback — user feedback form
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { FEEDBACK_SOURCE_TAG } from '@/lib/feedbackSource';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { enqueueFeedback } from '@/lib/sync/feedbackSync';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { readJson, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS, STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const at = new Date().toISOString();
    const entry = { ...form, at };
    const existing = readJson<unknown[]>(STORAGE_KEYS.betaFeedback, []);
    writeJson(STORAGE_KEYS.betaFeedback, [...existing, entry]);
    // Through the outbox, not a direct call whose result gets discarded: these notes
    // are the beta's interview record, and a phone with no signal is the normal case.
    // The device copy above is the receipt; the outbox owns delivery and retry.
    enqueueFeedback(
      {
        name: form.name || 'Beta Contributor',
        email: form.email,
        goals: `Results: ${form.results}\nTestimonial: ${form.testimonial}\nRating: ${form.rating}\nMassive action: ${form.massiveAction}`,
        /*
         * `.214` — one tag, because there has only ever been one.
         * `submitLead` computes `source = lead.source || lead.package_interest`
         * and writes that single value to both columns, so the old
         * `'beta-feedback'` was discarded on every submission ever made. The
         * founder read path filters on this constant.
         */
        package_interest: FEEDBACK_SOURCE_TAG,
        source: FEEDBACK_SOURCE_TAG,
        message: form.testimonial,
      },
      at
    );
    writeRaw(STORAGE_KEYS.betaContributor, 'true');
    writeRaw(`${STORAGE_KEY_PREFIXES.event}feedback`, Date.now().toString());
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <InfoPageShell
        icon={MessageSquare}
        eyebrow={t('feedbackEyebrow', { defaultValue: 'Feedback' })}
        title={t('infoFeedbackThankTitle', { defaultValue: 'Thank you' })}
        subtitle={t('infoFeedbackThankSubtitle', {
          defaultValue: 'Thanks — your notes help us improve the free logger and Coach.',
        })}
        variant="sections"
      >
        <Card className="bg-card text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="inline-flex items-center gap-2 border-2 border-border bg-card px-4 py-1 text-sm text-foreground">
                {t('feedbackThankBadge', { defaultValue: 'Thanks' })}
              </div>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm leading-relaxed">
                <p className="font-semibold">{t('feedbackThankRoadmap', { defaultValue: '✓ Your input shapes what we build next' })}</p>
                <p className="font-semibold">{t('feedbackThankEarly', { defaultValue: '✓ We’ll email when something useful ships' })}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  {t('feedbackThankEmail', { defaultValue: 'Check your inbox if you left an email.' })}
                </p>
              </div>
              <Button size="lg" variant="default" onClick={() => router.push('/log')}>
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
        eyebrow={t('feedbackEyebrow', { defaultValue: 'Feedback' })}
      title={t('infoFeedbackTitle', { defaultValue: 'Feedback' })}
      subtitle={t('infoFeedbackSubtitle', {
        defaultValue:
          'What worked, what didn’t, and what you want next. We read every note.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="bg-card">
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
                  className="mt-1 w-full h-24 border-2 border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
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
                  className="mt-1 w-full h-28 border-2 border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
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
                        variant={form.rating === r ? 'selected' : 'outline'}
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

              <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
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
