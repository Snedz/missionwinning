'use client';
/**
 * Page: /feedback — product friction notes (not a testimonial farm)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { composeFeedbackNote } from '@/lib/feedbackNote';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
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
      composeFeedbackNote({
        text: [
          `Friction: ${form.friction}`,
          form.expected ? `Expected: ${form.expected}` : null,
          form.nextWant ? `Want next: ${form.nextWant}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        email: form.email,
        name: form.name,
        screen: '/feedback',
        buildLabel: APP_BUILD_LABEL,
        online: typeof navigator === 'undefined' ? true : navigator.onLine,
      }),
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
        {/* Field manual: one exit, no badge farm. */}
        <div className="content-card space-y-4 p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">
            {t('feedbackThankRoadmap', {
              defaultValue: 'We read every note — friction first.',
            })}{' '}
            {t('feedbackThankEarly', {
              defaultValue: 'If you left email, we may follow up on a fix.',
            })}
          </p>
          <Button
            size="lg"
            variant="default"
            className="primary-action min-h-[52px] tap-target"
            onClick={() => router.push('/log')}
          >
            {t('feedbackBackToday', { defaultValue: 'Back to Today' })}
          </Button>
        </div>
      </InfoPageShell>
    );
  }

  return (
    <InfoPageShell
      icon={MessageSquare}
      eyebrow={t('feedbackEyebrow', { defaultValue: 'Feedback' })}
      title={t('infoFeedbackTitle', { defaultValue: 'Feedback' })}
      subtitle={t('infoFeedbackSubtitleBrief', {
        defaultValue: 'What broke or confused you. We read every note.',
      })}
      variant="sections"
      showLegalFooter
    >
      {/* Field manual: form is the page — no competing header card. */}
      <form onSubmit={handleSubmit} className="content-card space-y-6 p-6 sm:p-8">
        <p className="text-sm font-semibold">
          {t('infoFeedbackFormTitle', { defaultValue: 'What should we fix?' })}
        </p>
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

        <Button
          type="submit"
          size="lg"
          variant="default"
          className="primary-action w-full min-h-[52px] tap-target"
          disabled={loading}
        >
          {loading
            ? t('feedbackSubmitting', { defaultValue: 'Submitting…' })
            : t('feedbackSubmit', { defaultValue: 'Submit feedback' })}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">
          {t('feedbackFootnote', {
            defaultValue:
              'We may quote a short note with your permission. No polished testimonial required.',
          })}
        </p>
      </form>

      <SignInPrompt
        nextPath="/feedback"
        description={t('feedbackSignInDesc', {
          defaultValue: 'Sign in if you want this linked to your account — optional.',
        })}
      />
    </InfoPageShell>
  );
}
