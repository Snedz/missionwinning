'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Flame,
  Footprints,
  Menu,
  Shield,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { FaqSection } from '@/components/marketing/FaqSection';
import type { BodyScores } from '@/lib/score';

const DEMO_SCORES: BodyScores = {
  readiness: 82,
  strain: 45,
  recovery: 78,
  readinessLabelKey: 'todayBodyPrimePush',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

type AbVariant = 'founders' | 'mission';

const HERO_COPY: Record<
  AbVariant,
  { badge: string; headline: string; gradient: string; subtitle: string }
> = {
  mission: {
    badge: 'Free core forever · Global PWA · Works offline',
    headline: 'One app. Six pillars.',
    gradient: 'Your path forward.',
    subtitle:
      'Free workout tracking, nutrition, mobility, mind, activity, and education — forever, everywhere. Readiness, strain, and recovery on Today. Super Bundle adds AI Coach and premium depth when you are ready.',
  },
  founders: {
    badge: 'Founders pricing · Limited beta access',
    headline: 'Mission Winning.',
    gradient: 'Train smarter. Recover better.',
    subtitle:
      'The everything app for serious lifters — free core forever, premium Super Bundle for full synergy across Train, Fuel, Move, Mind, Track, and Learn.',
  },
};

const pillars = [
  {
    id: 'train',
    route: '/welcome',
    icon: Dumbbell,
    title: 'Train',
    subtitle: 'Free tracker + premium AI Coach',
    price: 'Free core',
    desc: 'Workout logger, builder, 200+ library, benchmarks, and history. Premium unlocks AI plan generator and pro templates.',
    features: ['Free full logger & PR tracking', 'Premium: AI Coach + pro programs', 'Synergizes with every pillar'],
    cta: 'Start free',
  },
  {
    id: 'fuel',
    route: '/nutrition',
    icon: Flame,
    title: 'Fuel',
    subtitle: 'Nutrition logging + recipes',
    price: 'Free core',
    desc: 'Macro log, water, and global-friendly high-protein recipes. Premium adds meal plans and periodized nutrition.',
    features: ['Free recipes & daily tracker', 'Premium: 92+ gated recipes', 'Powers recovery and training'],
    cta: 'Log nutrition',
  },
  {
    id: 'move',
    route: '/move',
    icon: Wind,
    title: 'Move',
    subtitle: 'Mobility flows + prehab',
    price: 'Free core',
    desc: 'Timed bodyweight mobility flows — free for everyone. Premium adds sports-specific prehab depth.',
    features: ['4 free guided flows', 'Premium: +5 prehab flows', 'Protects joints under load'],
    cta: 'Try a flow',
  },
  {
    id: 'mind',
    route: '/mind',
    icon: Brain,
    title: 'Mind',
    subtitle: 'Breathing + recovery habits',
    price: 'Free core',
    desc: 'Breathing timer, guided sessions, and daily check-in. Premium unlocks full guided session library.',
    features: ['Free breathing & check-in', 'Premium: +6 guided sessions', 'Boosts consistency'],
    cta: 'Open Mind',
  },
  {
    id: 'track',
    route: '/track',
    icon: Footprints,
    title: 'Track',
    subtitle: 'Activity log + weekly stats',
    price: 'Free core',
    desc: 'Manual activity logging and streaks — no GPS required. Premium adds structured programs and pace insights.',
    features: ['Free activity log', 'Premium: 5 activity programs', 'Completes your training picture'],
    cta: 'Log activity',
  },
  {
    id: 'learn',
    route: '/learn',
    icon: BookOpen,
    title: 'Learn',
    subtitle: 'Evidence-based education',
    price: 'Free core',
    desc: 'Eight free ISSA-aligned education paths. Premium unlocks six specialist programs (PT, bodybuilding, corrective, and more).',
    features: ['8 free education paths', 'Premium: 6 specialist programs', 'The right way, for everyone'],
    cta: 'Start learning',
  },
] as const;

const toolsHighlights = [
  {
    icon: Dumbbell,
    label: 'Free workout logger',
    desc: '5×5, custom builder, WOD-style sessions, history, and PRs. Metric or imperial. Offline PWA.',
  },
  {
    icon: TrendingUp,
    label: 'Mission Score on Today',
    desc: 'Readiness, strain, recovery rings plus cross-pillar Win Score — Bevel-inspired, strength-focused.',
  },
  {
    icon: Shield,
    label: 'Six pillars, one path',
    desc: 'Train, Fuel, Move, Mind, Track, Learn — free entry everywhere. Super Bundle for full depth.',
  },
];

const NAV_LINKS = [
  { href: '#tools', label: 'Free core' },
  { href: '#pillars', label: 'Pillars' },
  { href: '#bundle', label: 'Super Bundle' },
  { href: '#faq', label: 'FAQ' },
] as const;

const LANDING_FAQ = [
  {
    id: 'free',
    question: 'Is the core app really free forever?',
    answer:
      'Yes. Workout logging, library, nutrition basics, mobility flows, mind breathing, activity log, and learn paths are never paywalled. Premium Super Bundle adds AI Coach and full depth when you choose to upgrade.',
  },
  {
    id: 'offline',
    question: 'Does it work offline?',
    answer:
      'Install the PWA for offline workout logging, cached plans, and offline coach on Today. Built for rural and low-connectivity users worldwide.',
  },
  {
    id: 'bundle',
    question: 'What is the Super Bundle?',
    answer:
      'One subscription unlocks premium across all six pillars — AI Coach, premium Mind/Move/Track/Learn programs, 92+ recipes, and pro templates. Core tools stay free if you cancel.',
  },
  {
    id: 'who',
    question: 'Who is Mission Winning for?',
    answer:
      'Anyone who wants evidence-based training with holistic synergy — home gym lifters, bodyweight athletes, coaches, and users in low-resource settings. The path is free to start.',
  },
  {
    id: 'medical',
    question: 'Is this medical advice?',
    answer:
      'No. Mission Winning provides educational fitness tools. Consult qualified professionals before intense training.',
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function LandingPage() {
  const router = useRouter();
  const [abVariant, setAbVariant] = useState<AbVariant>('mission');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mw_ab_pricing_variant') as AbVariant | null;
    if (saved === 'founders' || saved === 'mission') {
      setAbVariant(saved);
    } else {
      localStorage.setItem('mw_ab_pricing_variant', 'mission');
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hero = HERO_COPY[abVariant];

  const goWelcome = useCallback(() => router.push('/welcome'), [router]);
  const goBundle = useCallback(() => router.push('/bundle'), [router]);

  const navLink = (href: string, label: string, onClick?: () => void) => (
    <a
      key={href}
      href={href}
      className="tap-target inline-flex items-center px-2 py-2 text-sm hover:text-emerald-400 transition-colors rounded-lg"
      onClick={(e) => {
        if (href.startsWith('#')) {
          e.preventDefault();
          scrollToId(href.slice(1));
        }
        onClick?.();
      }}
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white"
      >
        Skip to content
      </a>

      <nav className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex items-center gap-3 tap-target rounded-lg"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground shrink-0">
              MW
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold tracking-tight text-sm sm:text-base">MISSION WINNING</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Global health super-app</div>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l) => navLink(l.href, l.label))}
            <Button variant="outline" size="sm" className="tap-target ml-2" onClick={goWelcome}>
              Start free
            </Button>
            <Button size="sm" variant="fitness" className="tap-target" onClick={() => scrollToId('bundle')}>
              Super Bundle
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Button size="sm" variant="fitness" className="tap-target h-11" onClick={goWelcome}>
              Start free
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="tap-target shrink-0"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden max-h-[85vh]">
          <DialogHeader className="p-4 border-b border-border/60 space-y-0">
            <DialogTitle className="text-base text-left">Menu</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((l) =>
              navLink(l.href, l.label, () => setMobileNavOpen(false))
            )}
            <Button
              variant="fitness"
              className="primary-action mt-4"
              onClick={() => {
                setMobileNavOpen(false);
                goWelcome();
              }}
            >
              Start free — 2 min setup
            </Button>
            <Button
              variant="outline"
              className="tap-target mt-2"
              onClick={() => {
                setMobileNavOpen(false);
                scrollToId('bundle');
              }}
            >
              Explore Super Bundle
            </Button>
            <Button
              variant="ghost"
              className="tap-target text-emerald-400"
              onClick={() => {
                setMobileNavOpen(false);
                const trig = (window as Window & { triggerPwaInstall?: () => void }).triggerPwaInstall;
                if (trig) trig();
                else goWelcome();
              }}
            >
              Install PWA (offline)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main id="main-content">
        <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-border/60">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-xs sm:text-sm mb-6 border border-border/60">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                {hero.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
                {hero.headline}
                <br />
                <span className="fitness-text-gradient">{hero.gradient}</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg">{hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <Button
                  size="lg"
                  variant="fitness"
                  className="primary-action sm:w-auto sm:px-10"
                  onClick={goWelcome}
                >
                  Start free — 2 min setup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="tap-target sm:px-10 h-[52px] text-base"
                  onClick={() => scrollToId('bundle')}
                >
                  Explore Super Bundle
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>✓ Free core forever</span>
                <span>✓ 14 languages in-app</span>
                <span>✓ Offline PWA</span>
                <span>✓ Rural & bodyweight ready</span>
              </div>
            </div>
            <MetricsRow scores={DEMO_SCORES} demo />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-border/60">
          <div className="text-center mb-10">
            <div className="uppercase tracking-[0.2em] text-emerald-500/90 text-xs font-medium mb-3">
              The system problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Five apps. Zero synergy.
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              You log workouts in one place, protein in another, and mobility never happens — because nothing connects.
              Mission Winning unifies Train, Fuel, Move, Mind, Track, and Learn with one Win Score on Today.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-muted-foreground">
            <div className="space-y-4">
              <p>
                Most fitness tools gate the logger or drown you in ads. They treat training, nutrition, and recovery as
                separate products — so you train hard but never see the full picture.
              </p>
              <p>
                <strong className="text-foreground">Our promise:</strong> the core mission stays free forever — workout
                tracking, basics in every pillar, offline PWA, global access.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                Premium Super Bundle funds that mission: AI Coach, premium sessions, specialist Learn paths, and deeper
                Fuel/Move/Track — when you want the full synergistic path.
              </p>
              <p className="text-emerald-400/90 font-medium">
                Evidence-based. Accessible everywhere. The right way — not another fad app.
              </p>
            </div>
          </div>
        </section>

        <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="text-emerald-500 uppercase tracking-widest text-xs mb-2">Free forever</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Start with real tools — not a trial trap</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Log your first workout in minutes. No credit card. Core tracking never paywalled.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {toolsHighlights.map((t) => (
              <Card key={t.label} className="content-card hover:border-emerald-500/30 transition-colors">
                <CardHeader>
                  <t.icon className="h-8 w-8 text-emerald-500 mb-3" />
                  <CardTitle className="text-lg">{t.label}</CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-3">
            <Button size="lg" variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goWelcome}>
              Start free — log your first workout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground">
              5×5 · Custom builder · History · PRs · PWA install · Works offline
            </p>
          </div>
        </section>

        <section id="pillars" className="bg-muted/20 py-12 sm:py-16 border-y border-border/60 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-2">Six pillars</div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">One app. Holistic synergy.</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Free entry in every pillar. Super Bundle unlocks premium depth across all six — modeled on proven
                holistic bundle models.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pillars.map((p) => (
                <Card key={p.id} className="content-card flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                        <p.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-xl">{p.title}</CardTitle>
                        <CardDescription className="text-emerald-400/80 mt-0.5">{p.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-foreground/80 mt-2">{p.price}</div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                    <ul className="space-y-2 mb-6 text-sm flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant="fitness" className="tap-target w-full" onClick={() => router.push(p.route)}>
                      {p.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 max-w-2xl mx-auto">
              <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-3 text-center">Early users</div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {(() => {
                  try {
                    const fb = JSON.parse(localStorage.getItem('mw_beta_feedback') || '[]') as {
                      testimonial?: string;
                      results?: string;
                      rating?: number;
                    }[];
                    if (fb.length > 0) {
                      return fb.slice(0, 2).map((f, i) => (
                        <div key={i} className="bg-card/80 p-4 rounded-xl border border-border/60">
                          &ldquo;{f.testimonial || f.results}&rdquo;
                          <span className="block text-emerald-400 text-xs mt-2">
                            — Beta user · {f.rating}/5
                          </span>
                        </div>
                      ));
                    }
                  } catch {
                    /* ignore */
                  }
                  return (
                    <>
                      <div className="bg-card/80 p-4 rounded-xl border border-border/60">
                        &ldquo;The free tracker got me consistent. Cross-pillar coach on Today actually tells me what
                        to do next.&rdquo;
                        <span className="block text-emerald-400 text-xs mt-2">— Early user · 5/5</span>
                      </div>
                      <div className="bg-card/80 p-4 rounded-xl border border-border/60">
                        &ldquo;Free core for my family. Offline PWA works where signal does not.&rdquo;
                        <span className="block text-emerald-400 text-xs mt-2">— Early user · 5/5</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        <section id="bundle" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-16">
          <div className="text-center mb-8">
            <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-2">Super Bundle</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Replace your fitness app stack with one mission
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six pillars. One subscription. AI Coach, premium Mind/Move/Track/Learn, and deep Fuel — while core tracking
              stays free forever.
            </p>
          </div>

          <Card className="content-card border-emerald-500/30 overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Mission Winning Super Bundle</CardTitle>
              <CardDescription>Intro pricing for early members · Cancel anytime</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm">
                {pillars.map((p) => (
                  <div
                    key={p.id}
                    className="tap-target rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col items-center gap-1"
                  >
                    <p.icon className="h-5 w-5 text-emerald-400" />
                    <span className="font-medium">{p.title}</span>
                    <span className="text-[10px] text-muted-foreground">Free + Premium</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 text-sm max-w-md mx-auto">
                {[
                  'Premium AI Coach + plan generator',
                  '6 Mind · 5 Move · 5 Track · 6 Learn premium',
                  '92+ premium recipes & pro programs',
                  'Cross-pillar Win Score on Today',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goBundle}>
                  View pricing & unlock
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="tap-target sm:px-8 h-[52px]" onClick={goWelcome}>
                  Start free first
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Paying for premium funds the free mission for everyone, everywhere.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-border/60">
          <FaqSection
            id="faq"
            title="Common questions"
            subtitle="Free core forever. Premium funds the global mission."
            items={[...LANDING_FAQ]}
          />
        </section>

        <section id="coaching" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center border-b border-border/60 scroll-mt-16">
          <div className="uppercase text-emerald-500/90 tracking-widest text-xs mb-2">1-on-1 coaching</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Human coaching when you want accountability</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Application-based elite coaching — programming, nutrition, and weekly reviews. Separate from the Super Bundle
            app subscription.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left max-w-3xl mx-auto">
            {[
              {
                title: 'Monthly coaching',
                price: 'From $997/mo',
                desc: 'Full programming, nutrition, and weekly video reviews.',
              },
              {
                title: '90-day block',
                price: 'From $2,497',
                desc: 'Intensive transformation with assessments and premium app access.',
              },
              {
                title: 'Coach mentorship',
                price: 'Custom',
                desc: 'For trainers building a practice with Mission Winning systems.',
              },
            ].map((c) => (
              <Card key={c.title} className="content-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <div className="text-lg font-semibold text-emerald-400">{c.price}</div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{c.desc}</CardContent>
              </Card>
            ))}
          </div>

          <Button size="lg" variant="fitness" className="tap-target px-10 h-[52px]" onClick={() => router.push('/coaching')}>
            Apply for coaching
          </Button>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready for your first win?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Two minutes on Welcome. One workout logged. Your Mission Score starts on Today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goWelcome}>
              Start free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="tap-target sm:px-10 h-[52px]"
              onClick={() => scrollToId('bundle')}
            >
              Explore Super Bundle
            </Button>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-sm text-muted-foreground border-t border-border/60">
          <p className="text-center leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> Mission Winning provides educational fitness tools,
            not medical advice. Consult qualified professionals before intense training. We issue certificates of
            educational achievement — not licensure. Premium revenue supports free global access to core tools.
          </p>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground px-4">
        © Mission Winning ·{' '}
        <a href="#pillars" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Pillars
        </a>{' '}
        ·{' '}
        <a href="/bundle" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Bundle
        </a>{' '}
        ·{' '}
        <a href="/welcome" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Start free
        </a>{' '}
        ·{' '}
        <a href="/about" className="hover:text-emerald-400 tap-target inline-flex px-1">
          About
        </a>{' '}
        ·{' '}
        <a href="/vision" className="hover:text-emerald-400 tap-target inline-flex px-1">
          Vision
        </a>
      </footer>

      {showStickyCta && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          role="region"
          aria-label="Quick actions"
        >
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button variant="fitness" className="primary-action flex-1 min-h-[48px]" onClick={goWelcome}>
              Start free
            </Button>
            <Button variant="outline" className="tap-target flex-1 min-h-[48px]" onClick={() => scrollToId('bundle')}>
              Bundle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
