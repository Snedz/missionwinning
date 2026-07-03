'use client';

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
          defaultValue:
            'Your feedback helps make the free core and Super Bundle better for the global mission.',
        })}
        variant="sections"
      >
        <Card className="content-card text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-sm border border-emerald-500/30">
                Mission Builders
              </div>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm">
                <p className="font-semibold">✓ Super Bundle premium unlocks</p>
                <p className="font-semibold">✓ Input on roadmap + features</p>
                <p className="font-semibold">✓ Early access to updates</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Watch your email for updates + community drops.
                </p>
              </div>
              <Button size="lg" variant="fitness" onClick={() => router.push('/log')}>
                Back to Today
              </Button>
            </CardContent>
          </Card>
      </InfoPageShell>
    );
  }

  return (
    <InfoPageShell
      icon={MessageSquare}
      title={t('infoFeedbackTitle', { defaultValue: 'Share your wins' })}
      subtitle={t('infoFeedbackSubtitle', {
        defaultValue:
          "Tell us what results you're seeing, what worked, and what to build next. Beta founders shape the roadmap.",
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="content-card">
          <CardHeader>
            <CardTitle>{t('infoFeedbackFormTitle', { defaultValue: 'Beta founders feedback' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full name (optional)</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alex Rivera"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email (for follow-up)</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@winning.com"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Key results so far</Label>
                <textarea
                  className="mt-1 w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.results}
                  onChange={(e) => setForm({ ...form, results: e.target.value })}
                  placeholder="Added 25kg to squat in 6 weeks. Energy through the roof."
                  required
                />
              </div>

              <div>
                <Label>Your testimonial</Label>
                <textarea
                  className="mt-1 w-full h-28 rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.testimonial}
                  onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  placeholder="Stop waiting. The free tracker alone got me consistent..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Rate your results (1–5)</Label>
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
                  <Label>Biggest action you took</Label>
                  <Input
                    value={form.massiveAction}
                    onChange={(e) => setForm({ ...form, massiveAction: e.target.value })}
                    placeholder="Finally ran the 5x5 program start to finish."
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" variant="fitness" className="w-full" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit feedback'}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Your words may be featured (anonymized or with permission).
              </p>
            </form>
          </CardContent>
        </Card>

      <SignInPrompt
        nextPath="/feedback"
        description="Sign in to link feedback to your journey and sync across devices."
      />
    </InfoPageShell>
  );
}
