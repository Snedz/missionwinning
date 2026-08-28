'use client';
/**
 * Page: /programs — leftover education outlines.
 * Not nSuns. Not the training catalog (/library + /builder). Not a shop.
 * See: docs/IA_SKELETON.md, app/INDEX.md.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check } from 'lucide-react';
import { UnlockButton } from '@/components/UnlockButton';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import {
  PROGRAM_CATALOG,
  PROGRAM_EQUIP_FILTERS,
  PROGRAM_GOAL_FILTERS,
  PROGRAMS_FREE_BETA_BULLET_KEYS,
  programsEnFloor,
  type ProgramCatalogEntry,
} from '@/i18n/programsLocales';
import { getCurriculum } from '@/data/programCurricula';
import { useCallback, useState } from 'react';
import { isFreeBeta } from '@/lib/freeBeta';

export function ProgramsPage() {
  const { t } = useTranslation();
  const [filterGoal, setFilterGoal] = useState<string>('All');
  const [filterEquip, setFilterEquip] = useState<string>('All');
  const freeBeta = isFreeBeta();

  /**
   * Catalog strings live in async-hydrated packs. Without EN floors, first paint
   * shows raw keys (`progPtBullet5`). Free beta also rewrites pay-merch bullets.
   */
  const catalogLine = useCallback(
    (key: string) => {
      if (freeBeta) {
        const open = PROGRAMS_FREE_BETA_BULLET_KEYS[key];
        if (open) {
          return t(open.openBetaKey, { defaultValue: open.en });
        }
      }
      return t(key, { defaultValue: programsEnFloor(key) });
    },
    [freeBeta, t]
  );

  const filteredPrograms = PROGRAM_CATALOG.filter((prog) => {
    const goalMatch = filterGoal === 'All' || prog.goalFilter === filterGoal;
    const equipMatch = filterEquip === 'All' || prog.equipFilter === filterEquip;
    return goalMatch && equipMatch;
  });

  const exportProgramPDF = (prog: ProgramCatalogEntry) => {
    const title = catalogLine(prog.titleKey);
    const bullets = prog.bulletKeys.map((k) => `- ${catalogLine(k)}`).join('\n');
    const content = `${title}\n${catalogLine(prog.durationKey)} • ${catalogLine(prog.priceKey)}\n\nWhat You Get:\n${bullets}\n\n${catalogLine(prog.disclaimerKey)}\n\nMission Winning — free training platform.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}-MissionWinning-Beta.pdf.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <InfoPageShell
      className="house-programs"
      icon={BookOpen}
      eyebrow={t('programsEyebrow', { defaultValue: 'Programs' })}
      title={t('infoProgramsTitle', { defaultValue: 'Learn programs' })}
      subtitle={t('infoProgramsSubtitleBrief', {
        defaultValue: 'Program outlines. Free paths live in Learn.',
      })}
      variant="sections"
      showLegalFooter
    >
      {/* Quiet leftover: outlines first. Unlock / price stay extra. */}
      <p className="text-xs text-muted-foreground">
        {freeBeta
          ? t('programsCatalogIntroOpenBeta', {
              defaultValue:
                'Specialist education outlines below. Free core tools live in Learn and the public guide.',
            })
          : t('programsCatalogIntro', {
              defaultValue:
                'Specialist education outlines below. Free core tools live in Learn and the public guide. Super Bundle unlocks full premium depth.',
            })}{' '}
        <Link href="/learn" className="underline underline-offset-2">
          /learn
        </Link>
      </p>

      <div className="flex flex-wrap gap-2">
        <span className="house-kicker self-center">
          {t('programsFilterGoal', { defaultValue: 'Filter by goal:' })}
        </span>
        {PROGRAM_GOAL_FILTERS.map((g) => (
          <button
            key={g.value}
            type="button"
            className={`house-state${filterGoal === g.value ? ' is-on' : ''}`}
            onClick={() => setFilterGoal(g.value)}
          >
            {t(g.labelKey, { defaultValue: programsEnFloor(g.labelKey) || g.value })}
          </button>
        ))}
        <span className="house-kicker self-center">
          {t('programsFilterEquip', { defaultValue: 'Equipment:' })}
        </span>
        {PROGRAM_EQUIP_FILTERS.map((e) => (
          <button
            key={e.value}
            type="button"
            className={`house-state${filterEquip === e.value ? ' is-on' : ''}`}
            onClick={() => setFilterEquip(e.value)}
          >
            {t(e.labelKey, { defaultValue: programsEnFloor(e.labelKey) || e.value })}
          </button>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="house-empty">
          <p className="font-semibold">
            {t('programsNoMatchTitle', { defaultValue: 'No programs match' })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('programsNoMatchBody', {
              defaultValue: 'Nothing matches. Clear filters to see all programs.',
            })}
          </p>
          <button
            type="button"
            className="house-btn"
            onClick={() => {
              setFilterGoal('All');
              setFilterEquip('All');
            }}
          >
            {t('programsClearFilters', { defaultValue: 'Clear filters' })}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredPrograms.map((prog) => (
          <article key={prog.id} className="house-card space-y-3">
            <p className="font-semibold">{catalogLine(prog.titleKey)}</p>
            <p className="text-sm text-muted-foreground">{catalogLine(prog.durationKey)}</p>
            <ul className="space-y-2">
              {prog.bulletKeys.map((key) => (
                <li key={key} className="flex gap-3 text-sm">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden />
                  {catalogLine(key)}
                </li>
              ))}
            </ul>
            <details className="house-card group">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {t('programsCurriculumOutline', { defaultValue: 'Curriculum outline' })}
              </summary>
              <div className="space-y-4 pt-2">
                {(() => {
                  const curriculum = getCurriculum(prog.id);
                  if (!curriculum) return null;
                  return curriculum.modules.map((m) => (
                    <div key={m.index}>
                      <p className="text-sm font-semibold">
                        {t('programsModuleLabel', {
                          defaultValue: `Module ${m.index}`,
                          n: m.index,
                        })}
                        {': '}
                        {m.focus}
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {m.sessions.map((s) => (
                          <li key={s.title}>
                            <span className="font-semibold text-foreground">{s.title}</span>
                            <ul className="list-disc pl-4 mt-0.5">
                              {s.outline.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ));
                })()}
                <p className="text-sm text-muted-foreground">{catalogLine(prog.disclaimerKey)}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/feedback" className="house-btn house-btn-ghost">
                    {t('programsShareFeedback', { defaultValue: 'Share feedback' })}
                  </Link>
                  <button
                    type="button"
                    className="house-btn"
                    onClick={() => exportProgramPDF(prog)}
                  >
                    {t('programsDownloadSummary', { defaultValue: 'Download summary' })}
                  </button>
                </div>
                {!freeBeta && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {catalogLine(prog.durationKey)}
                      {!freeBeta && <> • {catalogLine(prog.priceKey)} one-time</>}
                    </p>
                    <UnlockButton
                      productId={prog.productId}
                      price={catalogLine(prog.priceKey).replace('$', '')}
                      title={catalogLine(prog.titleKey)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </details>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        <Link href="/coach" className="underline underline-offset-2">
          {t('programsCoachPointer', {
            defaultValue: 'Mission Coach writes the week from your logs.',
          })}
        </Link>{' '}
        {t('programsNotAStore', {
          defaultValue: 'These cards are education outlines, not a second store.',
        })}
      </p>
      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        {freeBeta
          ? t('programsFootOpenBeta', {
              defaultValue:
                'Education outlines for every track. Free core paths live in Learn — share feedback if something is unclear.',
            })
          : t('programsFootBundle', {
              defaultValue:
                'Bundle all programs for significant discount (coming soon). Existing purchasers get notified of updates.',
            })}
      </p>
    </InfoPageShell>
  );
}
