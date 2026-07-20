import type { GuideChapter, GuideSection } from '@/data/guidebook/types';
import { MAGAZINE_META } from '@/data/guidebook/magazineMeta';

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

function localizeSection(section: GuideSection, t: TranslateFn): GuideSection {
  const next: GuideSection = {
    ...section,
    title: t(`guideSection_${section.id}_title`, { defaultValue: section.title }),
    summary: t(`guideSection_${section.id}_summary`, { defaultValue: section.summary }),
    body: t(`guideSection_${section.id}_body`, { defaultValue: section.body }),
    practiceCTA: {
      ...section.practiceCTA,
      label: t(`guideSection_${section.id}_cta`, { defaultValue: section.practiceCTA.label }),
    },
  };

  if (section.callout) {
    next.callout = {
      title: t(`guideSection_${section.id}_callout_title`, {
        defaultValue: section.callout.title,
      }),
      body: t(`guideSection_${section.id}_callout_body`, {
        defaultValue: section.callout.body,
      }),
    };
  }

  if (section.table) {
    next.table = {
      caption: section.table.caption
        ? t(`guideSection_${section.id}_table_caption`, {
            defaultValue: section.table.caption,
          })
        : undefined,
      headers: section.table.headers.map((h, i) =>
        t(`guideSection_${section.id}_table_h${i}`, { defaultValue: h })
      ),
      rows: section.table.rows.map((row, ri) =>
        row.map((cell, ci) =>
          t(`guideSection_${section.id}_table_r${ri}c${ci}`, { defaultValue: cell })
        )
      ),
    };
  }

  if (section.checklist) {
    next.checklist = {
      title: t(`guideSection_${section.id}_checklist_title`, {
        defaultValue: section.checklist.title,
      }),
      items: section.checklist.items.map((item, i) =>
        t(`guideSection_${section.id}_checklist_i${i}`, { defaultValue: item })
      ),
    };
  }

  return next;
}

export function localizeGuidebookChapters(chapters: GuideChapter[], t: TranslateFn): GuideChapter[] {
  return chapters.map((chapter) => ({
    ...chapter,
    title: t(`guideChapter_${chapter.id}_title`, { defaultValue: chapter.title }),
    subtitle: t(`guideChapter_${chapter.id}_subtitle`, { defaultValue: chapter.subtitle }),
    sections: chapter.sections.map((section) => localizeSection(section, t)),
  }));
}

export type LocalizedMagazineMeta = {
  title: string;
  magazineLine: string;
  subtitle: string;
  version: string;
  editionLabel: string;
  siteOrigin: string;
  preface: string[];
  howToUse: string[];
  disclaimer: string[];
  prefaceEyebrow: string;
  prefaceHeading: string;
  howToEyebrow: string;
  howToHeading: string;
  howToHint: string;
  disclaimerEyebrow: string;
};

export function localizeMagazineMeta(t: TranslateFn): LocalizedMagazineMeta {
  const preface = MAGAZINE_META.preface.map((p, i) =>
    t(`magazinePreface_${i}`, { defaultValue: p })
  );
  const howToUse = MAGAZINE_META.howToUse.map((p, i) =>
    t(`magazineHowTo_${i}`, { defaultValue: p })
  );
  const disclaimer = MAGAZINE_META.disclaimer.map((p, i) =>
    t(`magazineDisclaimer_${i}`, { defaultValue: p })
  );
  return {
    title: t('magazineTitle', { defaultValue: MAGAZINE_META.title }),
    magazineLine: t('magazineLine', { defaultValue: MAGAZINE_META.magazineLine }),
    subtitle: t('magazineSubtitle', { defaultValue: MAGAZINE_META.subtitle }),
    version: MAGAZINE_META.version,
    editionLabel: t('magazineEditionLabel', { defaultValue: MAGAZINE_META.editionLabel }),
    siteOrigin: MAGAZINE_META.siteOrigin,
    preface,
    howToUse,
    disclaimer,
    prefaceEyebrow: t('magazinePrefaceEyebrow', { defaultValue: 'Preface' }),
    prefaceHeading: t('magazinePrefaceHeading', { defaultValue: 'Why we made this' }),
    howToEyebrow: t('magazineHowToEyebrow', { defaultValue: 'Using this magazine' }),
    howToHeading: t('magazineHowToHeading', { defaultValue: 'Read and practice' }),
    howToHint: t('magazineHowToHint', {
      defaultValue:
        'Use Contents on the right (or the Contents button on mobile) to expand a chapter and jump to any section — same pattern as a magazine table of contents.',
    }),
    disclaimerEyebrow: t('magazineDisclaimerEyebrow', { defaultValue: 'Disclaimer' }),
  };
}
