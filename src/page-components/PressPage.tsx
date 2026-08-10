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
import { ArtPicture } from '@/components/marketing/ArtPicture';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

const SHORT_BOILERPLATE =
  'Free offline workout tracker — no account required to start.';

const MEDIUM_BOILERPLATE =
  'Mission Winning is a free offline workout logger plus adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline as a PWA. Premium Super Bundle unlocks Coach depth and other pillars — never gates the logger.';

/** Free-beta press copy — no Super Bundle pitch while pay is muted (.654). */
const MEDIUM_BOILERPLATE_OPEN_BETA =
  'Mission Winning is a free offline workout logger plus adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline as a PWA. Open beta unlocks the full platform while we grow with testers.';

const COLORS = [
  { name: 'Paper', role: 'Ground', hex: '#f3f2f2', hsl: '0 4% 95%', swatch: '#f3f2f2', border: true },
  { name: 'Ink', role: 'Type · rules · mark', hex: '#201e1d', hsl: '20 5% 12%', swatch: '#201e1d', border: false },
  { name: 'Accent red', role: 'Action · key figures', hex: '#ec3013', hsl: '8 85% 50%', swatch: '#ec3013', border: false },
  { name: 'Accent 700', role: 'Small red text', hex: '#ae1800', hsl: '8 100% 34%', swatch: '#ae1800', border: false },
] as const;

const DOWNLOADS = [
  { href: '/brand/logo-icon.svg', label: 'Icon (ink)', hint: 'Primary mark' },
  { href: '/brand/logo-icon-reversed.svg', label: 'Icon (reversed)', hint: 'Paper on ink contexts' },
  { href: '/brand/logo-icon-red.svg', label: 'Icon (red)', hint: 'Poster variant — sparingly' },
  { href: '/brand/logo-wordmark-light.svg', label: 'Wordmark (on light)', hint: 'For paper backgrounds' },
  { href: '/brand/logo-wordmark-dark.svg', label: 'Wordmark (on dark)', hint: 'For ink backgrounds' },
  { href: '/brand/og-default.png', label: 'OG share image', hint: '1200 × 630 PNG' },
] as const;

const FONTS = [
  { name: 'Archivo 800', role: 'Display / wordmark' },
  { name: 'Archivo 400', role: 'Body' },
  { name: 'Archivo 600 caps', role: 'Kickers / telemetry' },
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
        'inline-flex min-h-[44px] items-center gap-1.5 border-2 border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground tap-target',
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function PressPage() {
  const freeBeta = isFreeBeta();
  const mediumBoilerplate = freeBeta ? MEDIUM_BOILERPLATE_OPEN_BETA : MEDIUM_BOILERPLATE;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="compact" />

      <header className="hero-field section-seam relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <ArtPicture base="/art/hero-field" fill priority className="object-cover opacity-40" />
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
            <p className="eyebrow-live">Press</p>
            <h1 className="display-hero text-foreground">
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
            <h2 className="display-section mb-8">Downloads</h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {DOWNLOADS.map((item, i) => (
              <Reveal key={item.href} delayMs={40 * i}>
                <a
                  href={item.href}
                  download
                  className="pressable-card flex items-center gap-4 border-2 border-border bg-card px-4 py-4 transition-colors hover:border-primary"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-tint text-primary">
                    <Download className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-seam bg-card py-14">
          <div className="mx-auto max-w-4xl px-5">
            <Reveal>
              <p className="eyebrow mb-2">02 · Identity</p>
              <h2 className="display-section mb-8">Palette &amp; type</h2>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COLORS.map((c, i) => (
                <Reveal key={c.hex} delayMs={40 * i}>
                  <div className="border-2 border-border bg-background p-3">
                    <div
                      className={cn(
                        'mb-3 h-16 border-2 border-border',
                        c.border && 'border-border'
                      )}
                      style={{ backgroundColor: c.swatch }}
                    />
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="text-[11px] text-primary">{c.hex}</code>
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
                  <div className="border-2 border-border bg-background px-4 py-4">
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
            <h2 className="display-section mb-8">Boilerplate</h2>
          </Reveal>
          <div className="space-y-4">
            <Reveal>
              <div className="border-2 border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Short</p>
                  <CopyButton text={SHORT_BOILERPLATE} />
                </div>
                <p className="text-sm leading-relaxed text-foreground">{SHORT_BOILERPLATE}</p>
              </div>
            </Reveal>
            <Reveal delayMs={60}>
              <div className="border-2 border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Medium</p>
                  <CopyButton text={mediumBoilerplate} />
                </div>
                <p className="text-sm leading-relaxed text-foreground">{mediumBoilerplate}</p>
              </div>
            </Reveal>
            <Reveal delayMs={90}>
              <p className="text-sm text-muted-foreground">
                Tagline:{' '}
                <span className="text-primary">Train Anywhere. Win Daily.</span>
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
              <h2 className="display-section mb-8">Do / don&apos;t</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              <Reveal>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">Do</span>
                    <span>Use paper, ink, and the one red as specified</span>
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
                    <span className="text-primary">Don&apos;t</span>
                    <span>Recolor the mark, or revive navy/emerald/brass</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">Don&apos;t</span>
                    <span>Round, stretch, rotate, or shadow the mark</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">Don&apos;t</span>
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
            <h2 className="display-section mb-4">Get in touch</h2>
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
              <code className="text-xs text-primary">docs/brand-guidelines.md</code>
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
