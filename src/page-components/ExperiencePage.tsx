/**
 * /experience — Mission dossier (Server Component spine).
 * GPU islands hydrate after idle; all copy is SSR HTML.
 */

import Link from 'next/link';
import { BUNDLE_PILLARS } from '@/lib/payments';
import { BUNDLE_PLANS } from '@/lib/bundleConfig';
import { EXERCISES } from '@/data/exercises';
import { ChapterShell } from '@/components/experience/ChapterShell';
import { ChapterRail } from '@/components/experience/ChapterRail';
import { HeroCanvasIsland } from '@/components/experience/HeroCanvasIsland';
import { WinScoreDemoIsland } from '@/components/experience/WinScoreDemoIsland';
import { CapabilityMatrix } from '@/components/experience/CapabilityMatrix';
import { CommissionCta } from '@/components/experience/CommissionCta';
import { XP, XP_JOURNEY } from '@/components/experience/experienceStrings';

function KineticQuote({ text }: { text: string }) {
  const words = text.split(/\s+/);
  return (
    <blockquote className="xp-quote">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="xp-word">
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </blockquote>
  );
}

export function ExperiencePage() {
  const exerciseCount = EXERCISES.length;
  const plans = [
    { id: 'monthly', label: XP.ch05Monthly, price: BUNDLE_PLANS.monthly.price },
    { id: '12mo', label: XP.ch05Annual, price: BUNDLE_PLANS['12mo'].price },
    { id: 'lifetime', label: XP.ch05Lifetime, price: BUNDLE_PLANS.lifetime.price },
  ] as const;

  return (
    <div className="xp-root">
      <div className="xp-progress" role="progressbar" aria-label={XP.progressAria} />
      <header className="xp-top">
        <Link href="/" className="xp-mark">
          <span className="xp-mark-badge">MW</span>
          <span className="xp-mark-name">Mission Winning</span>
        </Link>
        <Link href="/welcome" className="xp-top-cta">
          {XP.navStart}
        </Link>
      </header>

      <div className="xp-layout">
        <ChapterRail />
        <main className="xp-main">
          {/* 00 Signal */}
          <section id="signal" className="xp-chapter xp-hero hero-field texture-noise">
            <div className="xp-hero-inner xp-chapter-inner">
              <p className="xp-index">
                {XP.ch00Index} · {XP.ch00Eyebrow}
              </p>
              <h1>
                {XP.ch00Title}
                <br />
                {XP.ch00Title2}
              </h1>
              <p className="xp-lead">{XP.ch00Body}</p>
              <HeroCanvasIsland />
            </div>
          </section>

          {/* 01 Why */}
          <ChapterShell id="why" index={XP.ch01Index} eyebrow={XP.ch01Eyebrow}>
            <p className="eyebrow-honor mb-4">{XP.ch01Lead}</p>
            <KineticQuote text={XP.ch01Quote} />
            <p className="xp-lead mt-6">{XP.ch01Body}</p>
          </ChapterShell>

          {/* 02 Path */}
          <ChapterShell id="path" index={XP.ch02Index} eyebrow={XP.ch02Eyebrow}>
            <h2>{XP.ch02Title}</h2>
            <p className="xp-lead">{XP.ch02Body}</p>
            <div className="xp-path-wrap">
              <div className="xp-path-sticky">
                <div className="xp-path-track">
                  {XP_JOURNEY.map((j) => (
                    <article key={j.phase} className="xp-path-card card-elevated">
                      <p className="section-index">{j.phase}</p>
                      <h3>{j.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{j.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </ChapterShell>

          {/* 03 Pillars */}
          <ChapterShell id="chambers" index={XP.ch03Index} eyebrow={XP.ch03Eyebrow}>
            <h2>{XP.ch03Title}</h2>
            <p className="xp-lead">{XP.ch03Body}</p>
            <input type="radio" name="xp-pillar-mode" id="xp-show-free" className="xp-toggle" defaultChecked />
            <input type="radio" name="xp-pillar-mode" id="xp-show-premium" className="xp-toggle" />
            <div className="xp-toggle-ui">
              <label htmlFor="xp-show-free">{XP.ch03ToggleFree}</label>
              <label htmlFor="xp-show-premium">{XP.ch03TogglePremium}</label>
            </div>
            <div className="xp-pillars">
              {BUNDLE_PILLARS.map((p, i) => (
                <article key={p.id} className="xp-pillar" data-i={i}>
                  <p className="section-index">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-display text-2xl uppercase mt-1 mb-3">{p.name}</h3>
                  <p className="xp-free text-sm text-foreground/90">
                    <span className="eyebrow-live mr-2 text-[10px]">{XP.ch03Free}</span>
                    {p.free}
                  </p>
                  <p className="xp-premium text-sm text-muted-foreground">
                    <span className="eyebrow-honor mr-2 text-[10px]">{XP.ch03Bundle}</span>
                    {p.premium}
                  </p>
                </article>
              ))}
            </div>
          </ChapterShell>

          {/* 04 Score */}
          <ChapterShell id="score" index={XP.ch04Index} eyebrow={XP.ch04Eyebrow}>
            <h2>{XP.ch04Title}</h2>
            <p className="xp-lead">{XP.ch04Body}</p>
            <WinScoreDemoIsland />
          </ChapterShell>

          {/* 05 Free */}
          <ChapterShell id="free" index={XP.ch05Index} eyebrow={XP.ch05Eyebrow}>
            <h2>{XP.ch05Title}</h2>
            <p className="xp-lead">{XP.ch05Body}</p>
            <div className="xp-ledger">
              <p className="eyebrow-honor mb-3">{XP.ch05Ledger}</p>
              <div className="flex gap-2 mb-4">
                <div className="xp-swatch xp-swatch-oklch" title="Emerald" />
                <div className="xp-swatch xp-swatch-brass" title="Brass" />
              </div>
              <div className="xp-plan-row">
                <span>{XP.ch05Core}</span>
                <span className="font-mono tabular-nums text-primary">{XP.ch05CoreVal}</span>
              </div>
              {plans.map((pl) => (
                <div key={pl.id} className="xp-plan-row">
                  <span>{pl.label}</span>
                  <span className="font-mono tabular-nums">${pl.price}</span>
                </div>
              ))}
            </div>
          </ChapterShell>

          {/* 06 Proof */}
          <ChapterShell id="proof" index={XP.ch06Index} eyebrow={XP.ch06Eyebrow}>
            <h2>{XP.ch06Title}</h2>
            <p className="xp-lead">{XP.ch06Body}</p>
            <CapabilityMatrix exerciseCount={exerciseCount} />
          </ChapterShell>

          {/* 07 Commission */}
          <section id="commission" className="xp-chapter xp-commission hero-field">
            <div className="xp-chapter-inner">
              <p className="xp-index">
                {XP.ch07Index} · {XP.ch07Eyebrow}
              </p>
              <h2>{XP.ch07Title}</h2>
              <p className="xp-lead mx-auto mb-8">{XP.ch07Body}</p>
              <CommissionCta />
              <p className="xp-signoff">{XP.ch07Signoff}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
