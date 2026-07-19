/**
 * Page: /guide/print — full Beyond the Basics magazine (print / PDF source)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import {
  MAGAZINE_META,
  MAGAZINE_PDF_PATH,
  magazinePracticeUrl,
} from '@/data/guidebook/magazineMeta';
import { renderMagazineBody } from '@/lib/guidebook/renderMagazineBody';
import { GuideSectionExtras } from '@/components/learn/GuideSectionExtras';

function chapterIndex(n: number): string {
  return `CH ${String(n).padStart(2, '0')}`;
}

export function GuideMagazinePrintPage() {
  return (
    <div className="magazine-root print-sheet">
      <div className="magazine-screen-bar no-print">
        <div className="magazine-screen-bar-inner">
          <Link href="/guide" className="magazine-screen-link">
            ← Foundations Guide
          </Link>
          <div className="magazine-screen-actions">
            <a href={MAGAZINE_PDF_PATH} className="magazine-btn-primary" download>
              Download PDF
            </a>
            <Link href="/welcome" className="magazine-btn-ghost">
              Start training
            </Link>
          </div>
        </div>
      </div>

      <article className="magazine-document">
        {/* Cover — full-bleed hero-field */}
        <section className="magazine-cover magazine-page-break" aria-label="Cover">
          <div className="magazine-cover-field hero-field texture-grid">
            <div className="magazine-cover-inner">
              <p className="eyebrow-live magazine-cover-eyebrow">{MAGAZINE_META.editionLabel}</p>
              <h1 className="display-hero magazine-cover-title text-primary">{MAGAZINE_META.title}</h1>
              <p className="display-section magazine-cover-line text-brass">{MAGAZINE_META.magazineLine}</p>
              <p className="magazine-cover-sub">{MAGAZINE_META.subtitle}</p>
              <p className="magazine-cover-meta font-mono">
                v{MAGAZINE_META.version} · {MAGAZINE_META.siteOrigin}
              </p>
            </div>
          </div>
        </section>

        {/* Preface */}
        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">Preface</span>
          </div>
          <h2 className="display-section magazine-h2">Why we made this</h2>
          {MAGAZINE_META.preface.map((p) => (
            <p key={p.slice(0, 48)} className="magazine-prose">
              {p}
            </p>
          ))}
        </section>

        {/* How to use */}
        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">Using this magazine</span>
          </div>
          <h2 className="display-section magazine-h2">Read and practice</h2>
          <ol className="magazine-ol">
            {MAGAZINE_META.howToUse.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ol>
        </section>

        {/* TOC */}
        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">Contents</span>
          </div>
          <h2 className="display-section magazine-h2">Chapters</h2>
          <ol className="magazine-toc">
            {BEYOND_THE_BASICS_CHAPTERS.map((ch) => (
              <li key={ch.id} className="magazine-toc-item">
                <span className="section-index magazine-toc-num">{chapterIndex(ch.number)}</span>
                <span className="magazine-toc-title">{ch.title}</span>
                <span className="magazine-toc-sub">{ch.subtitle}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Chapters */}
        {BEYOND_THE_BASICS_CHAPTERS.map((ch) => (
          <section key={ch.id} className="magazine-chapter magazine-page-break">
            <header className="magazine-chapter-opener">
              <div className="briefing-rule mb-4">
                <span className="section-index">{chapterIndex(ch.number)}</span>
              </div>
              <h2 className="display-section magazine-h2">{ch.title}</h2>
              <p className="magazine-chapter-sub">{ch.subtitle}</p>
            </header>
            <div className="magazine-sections">
              {ch.sections.map((s) => (
                <article key={s.id} className="magazine-section">
                  <h3 className="magazine-h3">{s.title}</h3>
                  <p className="magazine-lead">{s.summary}</p>
                  <div className="magazine-body">{renderMagazineBody(s.body)}</div>
                  <GuideSectionExtras section={s} variant="magazine" />
                  {s.practiceCTA && (
                    <p className="magazine-practice">
                      <span className="eyebrow-live magazine-practice-label">Practice</span>
                      {s.practiceCTA.label} — {magazinePracticeUrl(s.practiceCTA.href)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Colophon */}
        <section className="magazine-colophon magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">Colophon</span>
          </div>
          <h2 className="display-section magazine-h2">Disclaimer</h2>
          {MAGAZINE_META.disclaimer.map((p) => (
            <p key={p.slice(0, 40)} className="magazine-prose magazine-prose-muted">
              {p}
            </p>
          ))}
          <p className="magazine-colophon-meta">
            <span className="eyebrow-honor magazine-edition-chip">{MAGAZINE_META.editionLabel}</span>
            <br />
            Beyond the Basics — The Mission Winning Magazine · v{MAGAZINE_META.version}
            <br />
            Online: {MAGAZINE_META.siteOrigin}/guide · PDF: {MAGAZINE_META.siteOrigin}
            {MAGAZINE_PDF_PATH}
          </p>
        </section>
      </article>
    </div>
  );
}
