'use client';
/**
 * Page: /press — Brand & media kit
 * See: app/INDEX.md, src/page-components/INDEX.md, docs/brand-guidelines.md
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, Download } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { cn } from '@/lib/utils';

const SHORT_BOILERPLATE =
  'Free offline workout tracker — no account required to start.';

const MEDIUM_BOILERPLATE =
  'Mission Winning is the free health everything app: workout tracking, nutrition, mobility, mind, activity, and learning in one path. Free core forever. Works offline as a PWA. Premium Super Bundle unlocks Coach and depth — never gates the logger.';

const COLORS = [
  { name: 'Navy', role: 'Canvas', hex: '#0a0c10', hsl: '222 24% 5%', swatch: '#0a0c10', border: true },
  { name: 'Emerald', role: 'Action', hex: '#27b07d', hsl: '158 64% 42%', swatch: '#27b07d', border: false },
  { name: 'Brass', role: 'Honor', hex: '#c7a860', hsl: '42 48% 58%', swatch: '#c7a860', border: false },
  { name: 'White', role: 'On dark', hex: '#ffffff', hsl: '0 0% 100%', swatch: '#ffffff', border: true },
] as const;

const DOWNLOADS = [
  { href: '/brand/logo-icon.svg', label: 'Icon (emerald)', hint: 'Primary mark' },
  { href: '/brand/logo-icon-navy.svg', label: 'Icon (navy)', hint: 'Dark UI / social' },
  { href: '/brand/logo-wordmark-dark.svg', label: 'Wordmark (dark)', hint: 'For dark backgrounds' },
  { href: '/brand/logo-wordmark-light.svg', label: 'Wordmark (light)', hint: 'For light backgrounds' },
  { href: '/brand/logo-icon-mono-light.svg', label: 'Mono light', hint: 'White mark' },
  { href: '/brand/logo-icon-mono-dark.svg', label: 'Mono dark', hint: 'Navy mark' },
  { href: '/brand/og-default.png', label: 'OG share image', hint: '1200 × 630 PNG' },
] as const;

const FONTS = [
  { name: 'Barlow Condensed', role: 'Display / wordmark' },
  { name: 'Inter', role: 'Body' },
  { name: 'IBM Plex Mono', role: 'Eyebrows / telemetry' },
] as const;

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-raised/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground',
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function PressPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="compact" />

      <header className="hero-field texture-noise section-seam relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/art/hero-field.avif"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        </div>
        <div className="relative z-[1] mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-end gap-6 px-5 pb-16 pt-20 sm:min-h-[60vh] sm:justify-center sm:pb-20">
          <Image
            src="/brand/logo-wordmark-dark.svg"
            alt="Mission Winning"
            width={460}
            height={80}
            priority
            className="h-auto w-[min(100%,22rem)] sm:w-[28rem]"
          />
          <div className="space-y-3">
            <p className="eyebrow text-primary">Press</p>
            <h1 className="display-hero text-4xl text-foreground sm:text-5xl md:text-6xl">
              Brand &amp; media kit
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Logos, colors, and copy for Mission Winning.
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="section-seam mx-auto max-w-4xl px-5 py-14">
          <Reveal>
            <p className="eyebrow mb-2">01 · Assets</p>
            <h2 className="display-section mb-8 text-2xl sm:text-3xl">Downloads</h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {DOWNLOADS.map((item, i) => (
              <Reveal key={item.href} delayMs={40 * i}>
                <a
                  href={item.href}
                  download
                  className="pressable-card flex items-center gap-4 rounded-2xl border border-border/50 bg-card/40 px-4 py-4 transition-colors hover:border-primary/35"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Download className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-seam-glow bg-surface-raised/20 py-14">
          <div className="mx-auto max-w-4xl px-5">
            <Reveal>
              <p className="eyebrow mb-2">02 · Identity</p>
              <h2 className="display-section mb-8 text-2xl sm:text-3xl">Palette &amp; type</h2>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COLORS.map((c, i) => (
                <Reveal key={c.hex} delayMs={40 * i}>
                  <div className="rounded-2xl border border-border/50 bg-card/30 p-3">
                    <div
                      className={cn(
                        'mb-3 h-16 rounded-xl',
                        c.border && 'border border-border/80'
                      )}
                      style={{ backgroundColor: c.swatch }}
                    />
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="text-[11px] text-brass">{c.hex}</code>
                      <CopyButton text={c.hex} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">HSL {c.hsl}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {FONTS.map((f, i) => (
                <Reveal key={f.name} delayMs={40 * i}>
                  <div className="rounded-2xl border border-border/50 px-4 py-4">
                    <p className="font-display text-lg uppercase tracking-wide text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-seam mx-auto max-w-4xl px-5 py-14">
          <Reveal>
            <p className="eyebrow mb-2">03 · Copy</p>
            <h2 className="display-section mb-8 text-2xl sm:text-3xl">Boilerplate</h2>
          </Reveal>
          <div className="space-y-4">
            <Reveal>
              <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Short</p>
                  <CopyButton text={SHORT_BOILERPLATE} />
                </div>
                <p className="text-sm leading-relaxed text-foreground">{SHORT_BOILERPLATE}</p>
              </div>
            </Reveal>
            <Reveal delayMs={60}>
              <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Medium</p>
                  <CopyButton text={MEDIUM_BOILERPLATE} />
                </div>
                <p className="text-sm leading-relaxed text-foreground">{MEDIUM_BOILERPLATE}</p>
              </div>
            </Reveal>
            <Reveal delayMs={90}>
              <p className="text-sm text-muted-foreground">
                Tagline:{' '}
                <span className="text-brass">Train Anywhere. Win Daily.</span>
                {' · '}
                <CopyButton text="Train Anywhere. Win Daily." />
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section-seam-glow bg-surface-raised/20 py-14">
          <div className="mx-auto max-w-4xl px-5">
            <Reveal>
              <p className="eyebrow mb-2">04 · Usage</p>
              <h2 className="display-section mb-8 text-2xl sm:text-3xl">Do / don&apos;t</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              <Reveal>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">Do</span>
                    <span>Use emerald, navy, and brass as specified</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">Do</span>
                    <span>Keep clear space around the mark (~¼ icon height)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">Do</span>
                    <span>Credit Mission Winning in coverage</span>
                  </li>
                </ul>
              </Reveal>
              <Reveal delayMs={60}>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-brass">Don&apos;t</span>
                    <span>Recolor to blue, violet, or cream/terracotta</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brass">Don&apos;t</span>
                    <span>Stretch, rotate, or glow the logo</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-brass">Don&apos;t</span>
                    <span>Imply partnership without permission</span>
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-seam mx-auto max-w-4xl px-5 py-14">
          <Reveal>
            <p className="eyebrow mb-2">05 · Contact</p>
            <h2 className="display-section mb-4 text-2xl sm:text-3xl">Get in touch</h2>
            <p className="text-sm text-muted-foreground">
              Support:{' '}
              <a
                href="mailto:support@missionwinning.com"
                className="text-primary hover:underline"
              >
                support@missionwinning.com
              </a>
              <br />
              Coaching inquiries:{' '}
              <a
                href="mailto:hello@missionwinning.com"
                className="text-primary hover:underline"
              >
                hello@missionwinning.com
              </a>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Full written guidelines live in the repo at{' '}
              <code className="text-xs text-brass">docs/brand-guidelines.md</code>
              .{' '}
              <Link href="/about" className="text-primary hover:underline">
                About Mission Winning
              </Link>
            </p>
          </Reveal>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
