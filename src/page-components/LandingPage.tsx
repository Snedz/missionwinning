'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { FaqSection } from '@/components/marketing/FaqSection';
import { LandingHeroMockup } from '@/components/marketing/LandingHeroMockup';
import { MarketingLanguageSelect } from '@/components/marketing/MarketingLanguageSelect';
import { LANDING_PILLAR_IDS, type LandingPillarId } from '@/i18n/landingLocales';

type AbVariant = 'founders' | 'mission';

const PILLAR_META: Record<
  LandingPillarId,
  { route: string; icon: typeof Dumbbell; faqId?: string }
> = {
  train: { route: '/welcome', icon: Dumbbell },
  fuel: { route: '/nutrition', icon: Flame },
  move: { route: '/move', icon: Wind },
  mind: { route: '/mind', icon: Brain },
  track: { route: '/track', icon: Footprints },
  learn: { route: '/learn', icon: BookOpen },
};

const TOOL_ICONS = [Dumbbell, TrendingUp, Shield] as const;

const NAV_LINKS = [
  { href: '#tools', labelKey: 'landingNavFreeCore' },
  { href: '#pillars', labelKey: 'landingNavPillars' },
  { href: '#bundle', labelKey: 'landingNavBundle' },
  { href: '#faq', labelKey: 'landingNavFaq' },
] as const;

const FAQ_IDS = ['free', 'offline', 'bundle', 'who', 'medical'] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function pillarFieldKey(id: LandingPillarId, field: string) {
  return `landingPillar_${id}_${field}`;
}

export function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
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

  const hero = useMemo(
    () =>
      abVariant === 'founders'
        ? {
            badge: t('landingHeroBadgeFounders'),
            headline: t('landingHeroHeadlineFounders'),
            gradient: t('landingHeroGradientFounders'),
            subtitle: t('landingHeroSubtitleFounders'),
          }
        : {
            badge: t('landingHeroBadge'),
            headline: t('landingHeroHeadline'),
            gradient: t('landingHeroGradient'),
            subtitle: t('landingHeroSubtitle'),
          },
    [abVariant, t],
  );

  const pillars = useMemo(
    () =>
      LANDING_PILLAR_IDS.map((id) => ({
        id,
        route: PILLAR_META[id].route,
        icon: PILLAR_META[id].icon,
        title: t(pillarFieldKey(id, 'title')),
        subtitle: t(pillarFieldKey(id, 'subtitle')),
        price: t('landingPillarPrice'),
        desc: t(pillarFieldKey(id, 'desc')),
        features: ([1, 2, 3] as const).map((n) => t(pillarFieldKey(id, `feat${n}`))),
        cta: t(pillarFieldKey(id, 'cta')),
      })),
    [t],
  );

  const toolsHighlights = useMemo(
    () =>
      TOOL_ICONS.map((icon, i) => ({
        icon,
        label: t(`landingTool${i + 1}Title` as 'landingTool1Title'),
        desc: t(`landingTool${i + 1}Desc` as 'landingTool1Desc'),
      })),
    [t],
  );

  const landingFaq = useMemo(
    () =>
      FAQ_IDS.map((id, i) => ({
        id,
        question: t(`landingFaq${i + 1}Q` as 'landingFaq1Q'),
        answer: t(`landingFaq${i + 1}A` as 'landingFaq1A'),
      })),
    [t],
  );

  const bundleFeatures = useMemo(
    () => [1, 2, 3, 4].map((n) => t(`landingBundleFeature${n}` as 'landingBundleFeature1')),
    [t],
  );

  const coachingTiers = useMemo(
    () =>
      [1, 2, 3].map((n) => ({
        title: t(`landingCoaching${n}Title` as 'landingCoaching1Title'),
        price: t(`landingCoaching${n}Price` as 'landingCoaching1Price'),
        desc: t(`landingCoaching${n}Desc` as 'landingCoaching1Desc'),
      })),
    [t],
  );

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
        {t('landingSkipToContent')}
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
              <div className="text-[10px] text-muted-foreground -mt-0.5">{t('marketingTagline')}</div>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l) => navLink(l.href, t(l.labelKey)))}
            <MarketingLanguageSelect className="tap-target ml-1 rounded-lg border border-border/60 bg-background/80 px-2 py-1.5 text-xs" />
            <Button variant="outline" size="sm" className="tap-target ml-1" onClick={goWelcome}>
              {t('landingStartFree')}
            </Button>
            <Button size="sm" variant="fitness" className="tap-target" onClick={() => scrollToId('bundle')}>
              {t('landingNavBundle')}
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <MarketingLanguageSelect className="tap-target rounded-lg border border-border/60 bg-background/80 px-1.5 py-1.5 text-[10px] max-w-[52px]" />
            <Button size="sm" variant="fitness" className="tap-target h-11" onClick={goWelcome}>
              {t('landingStartFree')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="tap-target shrink-0"
              aria-label={t('landingMenu')}
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
            <DialogTitle className="text-base text-left">{t('landingMenu')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((l) => navLink(l.href, t(l.labelKey), () => setMobileNavOpen(false)))}
            <Button
              variant="fitness"
              className="primary-action mt-4"
              onClick={() => {
                setMobileNavOpen(false);
                goWelcome();
              }}
            >
              {t('landingStartFreeLong')}
            </Button>
            <Button
              variant="outline"
              className="tap-target mt-2"
              onClick={() => {
                setMobileNavOpen(false);
                scrollToId('bundle');
              }}
            >
              {t('landingExploreBundle')}
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
              {t('landingInstallPwa')}
            </Button>
            <div className="pt-3">
              <MarketingLanguageSelect className="tap-target w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm" />
            </div>
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
                  {t('landingStartFreeLong')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="tap-target sm:px-10 h-[52px] text-base"
                  onClick={() => scrollToId('bundle')}
                >
                  {t('landingExploreBundle')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>{t('landingTrust1')}</span>
                <span>{t('landingTrust2')}</span>
                <span>{t('landingTrust3')}</span>
                <span>{t('landingTrust4')}</span>
              </div>
            </div>
            <LandingHeroMockup />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-border/60">
          <div className="text-center mb-10">
            <div className="uppercase tracking-[0.2em] text-emerald-500/90 text-xs font-medium mb-3">
              {t('landingProblemKicker')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('landingProblemTitle')}</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">{t('landingProblemLead')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-muted-foreground">
            <div className="space-y-4">
              <p>{t('landingProblemP1')}</p>
              <p>{t('landingProblemP2')}</p>
            </div>
            <div className="space-y-4">
              <p>{t('landingProblemP3')}</p>
              <p className="text-emerald-400/90 font-medium">{t('landingProblemHighlight')}</p>
            </div>
          </div>
        </section>

        <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="text-emerald-500 uppercase tracking-widest text-xs mb-2">{t('landingToolsKicker')}</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landingToolsTitle')}</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">{t('landingToolsSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {toolsHighlights.map((tool) => (
              <Card key={tool.label} className="content-card hover:border-emerald-500/30 transition-colors">
                <CardHeader>
                  <tool.icon className="h-8 w-8 text-emerald-500 mb-3" />
                  <CardTitle className="text-lg">{tool.label}</CardTitle>
                  <CardDescription>{tool.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-3">
            <Button size="lg" variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goWelcome}>
              {t('landingToolsCta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-muted-foreground">{t('landingToolsFoot')}</p>
          </div>
        </section>

        <section id="pillars" className="bg-muted/20 py-12 sm:py-16 border-y border-border/60 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-2">{t('landingPillarsKicker')}</div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landingPillarsTitle')}</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t('landingPillarsSubtitle')}</p>
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
              <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-3 text-center">
                {t('landingEarlyUsers')}
              </div>
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
                        &ldquo;{t('landingEarlyUser1')}&rdquo;
                        <span className="block text-emerald-400 text-xs mt-2">— Early user · 5/5</span>
                      </div>
                      <div className="bg-card/80 p-4 rounded-xl border border-border/60">
                        &ldquo;{t('landingEarlyUser2')}&rdquo;
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
            <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-2">{t('landingBundleKicker')}</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('landingBundleTitle')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t('landingBundleSubtitle')}</p>
          </div>

          <Card className="content-card border-emerald-500/30 overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{t('landingBundleCardTitle')}</CardTitle>
              <CardDescription>{t('landingBundleCardDesc')}</CardDescription>
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
                {bundleFeatures.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goBundle}>
                  {t('landingBundleCta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="tap-target sm:px-8 h-[52px]" onClick={goWelcome}>
                  {t('landingBundleStartFree')}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">{t('landingBundleFoot')}</p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-border/60">
          <FaqSection
            id="faq"
            title={t('landingFaqTitle')}
            subtitle={t('landingFaqSubtitle')}
            items={landingFaq}
          />
        </section>

        <section id="coaching" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center border-b border-border/60 scroll-mt-16">
          <div className="uppercase text-emerald-500/90 tracking-widest text-xs mb-2">{t('landingCoachingKicker')}</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('landingCoachingTitle')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">{t('landingCoachingDesc')}</p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left max-w-3xl mx-auto">
            {coachingTiers.map((c) => (
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
            {t('landingCoachingCta')}
          </Button>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t('landingCloseTitle')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('landingCloseSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="fitness" className="primary-action sm:w-auto sm:px-10" onClick={goWelcome}>
              {t('landingCloseCtaFree')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="tap-target sm:px-10 h-[52px]"
              onClick={() => scrollToId('bundle')}
            >
              {t('landingExploreBundle')}
            </Button>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-sm text-muted-foreground border-t border-border/60">
          <p className="text-center leading-relaxed">{t('landingDisclaimer')}</p>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground px-4">
        © Mission Winning ·{' '}
        <a href="#pillars" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('landingNavPillars')}
        </a>{' '}
        ·{' '}
        <a href="/bundle" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterBundle')}
        </a>{' '}
        ·{' '}
        <a href="/welcome" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterStart')}
        </a>{' '}
        ·{' '}
        <a href="/about" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterAbout')}
        </a>{' '}
        ·{' '}
        <a href="/vision" className="hover:text-emerald-400 tap-target inline-flex px-1">
          {t('marketingFooterVision')}
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
              {t('landingStartFree')}
            </Button>
            <Button variant="outline" className="tap-target flex-1 min-h-[48px]" onClick={() => scrollToId('bundle')}>
              {t('marketingFooterBundle')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
