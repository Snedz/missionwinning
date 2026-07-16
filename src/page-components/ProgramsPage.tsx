'use client';
/**
 * Page: /programs — program listing
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Check } from 'lucide-react';
import { UnlockButton } from '@/components/UnlockButton';
import { InfoPageShell } from '@/components/layout/InfoPageShell';
import {
  PROGRAM_CATALOG,
  PROGRAM_EQUIP_FILTERS,
  PROGRAM_GOAL_FILTERS,
  type ProgramCatalogEntry,
} from '@/i18n/programsLocales';
import { getCurriculum } from '@/data/programCurricula';
import { useState } from 'react';

export function ProgramsPage() {
  const { t } = useTranslation();
  const [filterGoal, setFilterGoal] = useState<string>('All');
  const [filterEquip, setFilterEquip] = useState<string>('All');

  const filteredPrograms = PROGRAM_CATALOG.filter((prog) => {
    const goalMatch = filterGoal === 'All' || prog.goalFilter === filterGoal;
    const equipMatch = filterEquip === 'All' || prog.equipFilter === filterEquip;
    return goalMatch && equipMatch;
  });

  const exportProgramPDF = (prog: ProgramCatalogEntry) => {
    const title = t(prog.titleKey);
    const bullets = prog.bulletKeys.map((k) => `- ${t(k)}`).join('\n');
    const content = `${title}\n${t(prog.durationKey)} • ${t(prog.priceKey)}\n\nWhat You Get:\n${bullets}\n\n${t(prog.disclaimerKey)}\n\nMission Winning — Free Core + Super Bundle.`;
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
      icon={BookOpen}
      eyebrow={t('programsEyebrow', { defaultValue: 'Programs' })}
      title={t('infoProgramsTitle', { defaultValue: 'Learn programs' })}
      subtitle={t('infoProgramsSubtitle', {
        defaultValue:
          'Premium practical education as part of the Super Bundle. Free core tools and intros for everyone worldwide.',
      })}
      variant="sections"
      showLegalFooter
    >
      <Card className="content-card">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {t('programsCatalogIntro', {
            defaultValue:
              'Specialist education outlines below. Free core tools live in Learn and the public guide. Super Bundle unlocks full premium depth.',
          })}{' '}
          <Link href="/learn" className="text-primary hover:underline">
            /learn
          </Link>
          {' · '}
          <Link href="/bundle" className="text-primary hover:underline">
            Super Bundle
          </Link>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="text-muted-foreground self-center">
          {t('programsFilterGoal', { defaultValue: 'Filter by goal:' })}
        </span>
        {PROGRAM_GOAL_FILTERS.map((g) => (
          <Button
            key={g.value}
            size="sm"
            variant={filterGoal === g.value ? 'default' : 'outline'}
            onClick={() => setFilterGoal(g.value)}
          >
            {t(g.labelKey, { defaultValue: g.value })}
          </Button>
        ))}
        <span className="text-muted-foreground self-center ml-2">
          {t('programsFilterEquip', { defaultValue: 'Equipment:' })}
        </span>
        {PROGRAM_EQUIP_FILTERS.map((e) => (
          <Button
            key={e.value}
            size="sm"
            variant={filterEquip === e.value ? 'default' : 'outline'}
            onClick={() => setFilterEquip(e.value)}
          >
            {t(e.labelKey, { defaultValue: e.value })}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredPrograms.map((prog) => (
          <Card key={prog.id} className="content-card">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{t(prog.titleKey)}</CardTitle>
                  <div className="text-primary mt-1 text-sm">
                    {t(prog.durationKey)} • {t(prog.priceKey)} one-time
                  </div>
                </div>
                <UnlockButton
                  productId={prog.productId}
                  price={t(prog.priceKey).replace('$', '')}
                  title={t(prog.titleKey)}
                  className="mt-2"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      {t('programsWhatYouGet', { defaultValue: 'What you get' })}
                    </h4>
                    <ul className="space-y-2">
                      {prog.bulletKeys.map((key) => (
                        <li key={key} className="flex gap-3 text-sm">
                          <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />{' '}
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {(() => {
                    const curriculum = getCurriculum(prog.id);
                    if (!curriculum) return null;
                    return (
                      <div>
                        <h4 className="font-semibold mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                          {t('programsCurriculumOutline', {
                            defaultValue: 'Curriculum outline',
                          })}
                        </h4>
                        <div className="space-y-2">
                          {curriculum.modules.map((m) => (
                            <details
                              key={m.index}
                              className="rounded-xl border border-border/50 px-3 py-2 text-sm"
                            >
                              <summary className="cursor-pointer font-medium list-none flex justify-between gap-2">
                                <span>
                                  {t('programsModuleLabel', {
                                    defaultValue: `Module ${m.index}`,
                                    n: m.index,
                                  })}
                                  {': '}
                                  {m.focus}
                                </span>
                                <span className="text-muted-foreground">+</span>
                              </summary>
                              <ul className="mt-2 space-y-2 text-muted-foreground pl-1">
                                {m.sessions.map((s) => (
                                  <li key={s.title}>
                                    <span className="text-foreground/90 font-medium">
                                      {s.title}
                                    </span>
                                    <ul className="list-disc pl-4 mt-0.5">
                                      {s.outline.map((line) => (
                                        <li key={line}>{line}</li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="md:col-span-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm space-y-3">
                  <div className="font-semibold text-primary text-xs uppercase tracking-wide">
                    {t('programsBundleNote', { defaultValue: 'Free intro — full in Super Bundle' })}
                  </div>
                  <p className="text-muted-foreground">{t(prog.disclaimerKey)}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/feedback" className="text-primary hover:underline text-xs">
                      Share feedback →
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportProgramPDF(prog)}
                      className="text-xs h-7"
                    >
                      {t('programsDownloadSummary', { defaultValue: 'Download summary' })}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        Bundle all programs for significant discount (coming soon). Existing purchasers get notified
        of updates.
      </p>
    </InfoPageShell>
  );
}
