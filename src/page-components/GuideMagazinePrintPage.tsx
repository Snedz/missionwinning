'use client';
/**
 * Page: /guide/print — full Beyond the Basics magazine (print / PDF source)
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import {
  MAGAZINE_META,
  MAGAZINE_PDF_PATH,
  magazinePdfPathForLang,
  magazinePracticeUrl,
} from '@/data/guidebook/magazineMeta';
import { localizeGuidebookChapters, localizeMagazineMeta } from '@/lib/localizeGuidebook';
import { isRtlLang, normalizeAppLang } from '@/i18n/appLangs';
import { renderMagazineBody } from '@/lib/guidebook/renderMagazineBody';
import { GuideSectionExtras } from '@/components/learn/GuideSectionExtras';

function chapterIndex(n: number): string {
  return `CH ${String(n).padStart(2, '0')}`;
}

export function GuideMagazinePrintPage() {
  const { t, i18n: i18nHook } = useTranslation();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');

  useEffect(() => {
    if (langParam) {
      void i18n.changeLanguage(normalizeAppLang(langParam));
    }
  }, [langParam]);

  const lang = normalizeAppLang(i18nHook.language);
  const meta = useMemo(() => localizeMagazineMeta(t), [t, i18nHook.language]);
  const chapters = useMemo(
    () => localizeGuidebookChapters(BEYOND_THE_BASICS_CHAPTERS, t),
    [t, i18nHook.language]
  );
  const pdfHref = magazinePdfPathForLang(lang);
  const rtl = isRtlLang(lang);

  return (
    <div className="magazine-root print-sheet" dir={rtl ? 'rtl' : 'ltr'} lang={lang}>
      <div className="magazine-screen-bar no-print">
        <div className="magazine-screen-bar-inner">
          <Link href="/guide" className="magazine-screen-link">
            {t('magazineBackToGuide', { defaultValue: '← Foundations Guide' })}
          </Link>
          <div className="magazine-screen-actions">
            <a href={pdfHref} className="magazine-btn-primary" download>
              {t('magazineDownloadPdf', { defaultValue: 'Download PDF' })}
            </a>
            <Link href="/welcome" className="magazine-btn-ghost">
              {t('magazineStartTraining', { defaultValue: 'Start training' })}
            </Link>
          </div>
        </div>
      </div>

      <article className="magazine-document">
        <section className="magazine-cover magazine-page-break" aria-label="Cover">
          <div className="magazine-cover-field hero-field texture-grid">
            <div className="magazine-cover-inner">
              <p className="eyebrow-live magazine-cover-eyebrow">{meta.editionLabel}</p>
              <h1 className="display-hero magazine-cover-title text-primary">{meta.title}</h1>
              <p className="display-section magazine-cover-line text-brass">{meta.magazineLine}</p>
              <p className="magazine-cover-sub">{meta.subtitle}</p>
              <p className="magazine-cover-meta font-mono">
                v{meta.version} · {meta.siteOrigin}
              </p>
            </div>
          </div>
        </section>

        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">{meta.prefaceEyebrow}</span>
          </div>
          <h2 className="display-section magazine-h2">{meta.prefaceHeading}</h2>
          {meta.preface.map((p) => (
            <p key={p.slice(0, 48)} className="magazine-prose">
              {p}
            </p>
          ))}
        </section>

        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">{meta.howToEyebrow}</span>
          </div>
          <h2 className="display-section magazine-h2">{meta.howToHeading}</h2>
          <ol className="magazine-ol">
            {meta.howToUse.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="magazine-front magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">{t('magazineContents', { defaultValue: 'Contents' })}</span>
          </div>
          <h2 className="display-section magazine-h2">
            {t('magazineAllChapters', { defaultValue: 'All chapters' })}
          </h2>
          <ol className="magazine-toc">
            {chapters.map((ch) => (
              <li key={ch.id} className="magazine-toc-item">
                <span className="section-index magazine-toc-num">{chapterIndex(ch.number)}</span>
                <span className="magazine-toc-title">{ch.title}</span>
                <span className="magazine-toc-sub">{ch.subtitle}</span>
              </li>
            ))}
          </ol>
        </section>

        {chapters.map((ch) => (
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
                      <span className="eyebrow-live magazine-practice-label">
                        {t('guidebookPracticeInApp', { defaultValue: 'Practice' })}
                      </span>
                      {s.practiceCTA.label} — {magazinePracticeUrl(s.practiceCTA.href)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="magazine-colophon magazine-page-break">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">{meta.disclaimerEyebrow}</span>
          </div>
          <h2 className="display-section magazine-h2">{meta.disclaimerEyebrow}</h2>
          {meta.disclaimer.map((p) => (
            <p key={p.slice(0, 40)} className="magazine-prose magazine-prose-muted">
              {p}
            </p>
          ))}
          <p className="magazine-colophon-meta">
            <span className="eyebrow-honor magazine-edition-chip">{meta.editionLabel}</span>
            <br />
            {meta.title} — {meta.magazineLine} · v{meta.version}
            <br />
            Online: {MAGAZINE_META.siteOrigin}/guide · PDF: {MAGAZINE_META.siteOrigin}
            {MAGAZINE_PDF_PATH}
          </p>
        </section>
      </article>
    </div>
  );
}
