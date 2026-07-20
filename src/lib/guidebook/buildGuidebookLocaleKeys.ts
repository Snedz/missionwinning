/**
 * Build EN guidebook i18n keys from chapter data + magazine meta.
 * Translations live in locale packs / guidebookLocales overrides.
 */

import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { MAGAZINE_META } from '@/data/guidebook/magazineMeta';
import type { GuideChapter } from '@/data/guidebook/types';

function sectionKeys(chapters: GuideChapter[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chapter of chapters) {
    out[`guideChapter_${chapter.id}_title`] = chapter.title;
    out[`guideChapter_${chapter.id}_subtitle`] = chapter.subtitle;
    for (const section of chapter.sections) {
      out[`guideSection_${section.id}_title`] = section.title;
      out[`guideSection_${section.id}_summary`] = section.summary;
      out[`guideSection_${section.id}_body`] = section.body;
      out[`guideSection_${section.id}_cta`] = section.practiceCTA.label;
      if (section.callout) {
        out[`guideSection_${section.id}_callout_title`] = section.callout.title;
        out[`guideSection_${section.id}_callout_body`] = section.callout.body;
      }
      if (section.table) {
        if (section.table.caption) {
          out[`guideSection_${section.id}_table_caption`] = section.table.caption;
        }
        section.table.headers.forEach((h, i) => {
          out[`guideSection_${section.id}_table_h${i}`] = h;
        });
        section.table.rows.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            out[`guideSection_${section.id}_table_r${ri}c${ci}`] = cell;
          });
        });
      }
      if (section.checklist) {
        out[`guideSection_${section.id}_checklist_title`] = section.checklist.title;
        section.checklist.items.forEach((item, i) => {
          out[`guideSection_${section.id}_checklist_i${i}`] = item;
        });
      }
    }
  }
  return out;
}

export function buildMagazineMetaLocaleKeys(): Record<string, string> {
  const out: Record<string, string> = {
    magazineTitle: MAGAZINE_META.title,
    magazineLine: MAGAZINE_META.magazineLine,
    magazineSubtitle: MAGAZINE_META.subtitle,
    magazineEditionLabel: MAGAZINE_META.editionLabel,
    magazinePrefaceEyebrow: 'Preface',
    magazinePrefaceHeading: 'Why we made this',
    magazineHowToEyebrow: 'Using this magazine',
    magazineHowToHeading: 'Read and practice',
    magazineHowToHint:
      'Use Contents on the right (or the Contents button on mobile) to expand a chapter and jump to any section — same pattern as a magazine table of contents.',
    magazineDisclaimerEyebrow: 'Disclaimer',
    magazineContents: 'Contents',
    magazineAllChapters: 'All chapters',
    magazineDownloadPdf: 'Download PDF',
    magazinePrintView: 'Print view',
    magazinePdfLocalized: 'PDF matches your language when available.',
    magazinePdfFallbackEn: 'Localized PDF not built yet — English PDF will download.',
    magazineOpenContents: 'Open contents',
    magazineStartFree: 'Start free',
    magazineBackToGuide: '← Foundations Guide',
    magazineStartTraining: 'Start training',
    magazineChapterOverview: 'Chapter overview',
  };
  MAGAZINE_META.preface.forEach((p, i) => {
    out[`magazinePreface_${i}`] = p;
  });
  MAGAZINE_META.howToUse.forEach((p, i) => {
    out[`magazineHowTo_${i}`] = p;
  });
  MAGAZINE_META.disclaimer.forEach((p, i) => {
    out[`magazineDisclaimer_${i}`] = p;
  });
  return out;
}

/** EN keys for free guidebook bodies and magazine chrome (premium uses API defaultValue). */
export function buildGuidebookContentLocaleKeys(): Record<string, string> {
  return {
    ...sectionKeys(BEYOND_THE_BASICS_CHAPTERS),
    ...buildMagazineMetaLocaleKeys(),
  };
}
