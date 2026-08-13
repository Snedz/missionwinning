/**
 * Page: /guide/mission-winning-vs-* — public Learn comparison (AEO explanation)
 * See: app/INDEX.md, src/page-components/INDEX.md, docs/LEARN_VS_PAGES_PLAN.md
 */

import Link from 'next/link';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { GuideSectionExtras } from '@/components/learn/GuideSectionExtras';
import { renderMagazineBody } from '@/lib/guidebook/renderMagazineBody';
import {
  learnVsJsonLdBundle,
  learnVsPublicHref,
  otherLearnVsPages,
  type LearnVsPage,
} from '@/lib/learnVsPages';
import { jsonLdScript } from '@/lib/publicSeo';
import { siteBaseUrl } from '@/lib/seoMetadata';

type Props = { page: LearnVsPage };

export function LearnVsPublicPage({ page }: Props) {
  const others = otherLearnVsPages(page.id);
  const jsonLd = learnVsJsonLdBundle(page, siteBaseUrl());

  return (
    <PublicPageShell
      eyebrow="Compare"
      title={page.title}
      subtitle={page.subtitle}
      ctaHref="/welcome"
      ctaLabel="Start free"
      breadcrumb={
        <Link href="/guide" className="text-primary hover:underline">
          ← Foundations Guide
        </Link>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <section className="space-y-3">
        <p className="eyebrow">Explanation</p>
        {renderMagazineBody(page.lead, {
          paragraphClassName: 'text-sm leading-relaxed text-foreground',
        })}
      </section>

      {page.sections.map((section) => (
        <article key={section.id} id={section.id} className="space-y-3 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground">
            {section.title}
          </h2>
          <p className="text-sm text-muted-foreground">{section.summary}</p>
          <div className="space-y-3">
            {renderMagazineBody(section.body, {
              paragraphClassName: 'text-sm leading-relaxed text-foreground',
            })}
          </div>
          <GuideSectionExtras
            section={{
              callout: section.callout,
              table: section.table,
              checklist: section.checklist,
            }}
            variant="app"
          />
        </article>
      ))}

      <nav aria-label="Other comparisons" className="space-y-2 border-t-2 border-border pt-6">
        <p className="eyebrow">Also compare</p>
        <ul className="space-y-2 text-sm">
          {others.map((other) => (
            <li key={other.id}>
              <Link href={learnVsPublicHref(other.id)} className="text-primary hover:underline">
                {other.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PublicPageShell>
  );
}
