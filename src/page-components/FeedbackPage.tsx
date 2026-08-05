'use client';
/**
 * Page: /feedback — product friction notes (not a testimonial farm)
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
    friction: '',
    expected: '',
    nextWant: '',
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
    enqueueFeedback(
      {
        name: form.name || 'Tester',
        email: form.email,
        goals: [
          `Friction: ${form.friction}`,
          form.expected ? `Expected: ${form.expected}` : null,
          form.nextWant ? `Want next: ${form.nextWant}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        package_interest: FEEDBACK_SOURCE_TAG,
        source: FEEDBACK_SOURCE_TAG,
        message: form.friction,
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
              <p className="font-medium">
                {t('feedbackThankRoadmap', {
                  defaultValue: '✓ We read every note — friction first',
                })}
              </p>
              <p className="font-medium">
                {t('feedbackThankEarly', {
                  defaultValue: '✓ If you left email, we may follow up on a fix',
                })}
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
      title={t('infoFeedbackTitle', { defaultValue: 'Feedback' })}
      subtitle={t('infoFeedbackSubtitle', {
        defaultValue: 'What confused you, what broke, and what we should fix next. We read every note.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t('infoFeedbackFormTitle', { defaultValue: 'What should we fix?' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('feedbackNameLabel', { defaultValue: 'Name (optional)' })}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('feedbackNamePlaceholder', { defaultValue: 'Alex' })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>
                  {t('feedbackEmailLabel', { defaultValue: 'Email (optional, for follow-up)' })}
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('feedbackEmailPlaceholder', { defaultValue: 'you@example.com' })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>
                {t('feedbackFrictionLabel', {
                  defaultValue: 'What confused you or broke? (required)',
                })}
              </Label>
              <textarea
                className="mt-1 w-full h-28 border-2 border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                value={form.friction}
                onChange={(e) => setForm({ ...form, friction: e.target.value })}
                placeholder={t('feedbackFrictionPlaceholder', {
                  defaultValue:
                    'e.g. Rest timer was hard to find mid-set outdoors. Or: Coach week ignored my missed day.',
                })}
                required
              />
            </div>

            <div>
              <Label>
                {t('feedbackExpectedLabel', { defaultValue: 'What did you expect instead? (optional)' })}
              </Label>
              <textarea
                className="mt-1 w-full h-20 border-2 border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                value={form.expected}
                onChange={(e) => setForm({ ...form, expected: e.target.value })}
                placeholder={t('feedbackExpectedPlaceholder', {
                  defaultValue: 'e.g. One big Skip button after the set, not three presets.',
                })}
              />
            </div>

            <div>
              <Label>
                {t('feedbackNextWantLabel', {
                  defaultValue: 'One thing to improve next (optional)',
                })}
              </Label>
              <Input
                value={form.nextWant}
                onChange={(e) => setForm({ ...form, nextWant: e.target.value })}
                placeholder={t('feedbackNextWantPlaceholder', {
                  defaultValue: 'e.g. Clearer set kind labels on phone.',
                })}
                className="mt-1"
              />
            </div>

            <Button type="submit" size="lg" variant="default" className="w-full" disabled={loading}>
              {loading
                ? t('feedbackSubmitting', { defaultValue: 'Submitting…' })
                : t('feedbackSubmit', { defaultValue: 'Submit feedback' })}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              {t('feedbackFootnote', {
                defaultValue:
                  'We may quote a short note with your permission. No polished testimonial required.',
              })}
            </p>
          </form>
        </CardContent>
      </Card>

      <SignInPrompt
        nextPath="/feedback"
        description={t('feedbackSignInDesc', {
          defaultValue: 'Sign in if you want this linked to your account — optional.',
        })}
      />
    </InfoPageShell>
  );
}
