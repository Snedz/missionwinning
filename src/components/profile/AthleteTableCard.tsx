'use client';
/**
 * The table — MySpace interests, retrained for training (IDENTITY_SOCIAL_PLAN §3).
 *
 * Picks-from-sets only. No free text, no anthem URL (C5 / rights). Local only
 * until S4. Display is the authored answers; the editor lives in a disclosure
 * so the page reads as a record, not a form. Save is outline so `/profile`
 * stays at 0 red actions.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  ATHLETE_PAGE_CHANGED,
  ATHLETE_TABLE_ROWS,
  loadAthletePageConfig,
  picksForRow,
  saveAthletePageConfig,
  type AthletePageConfig,
  type AthleteTablePicks,
  type AthleteTableRowId,
} from '@/lib/identity/athleteProfile';

function rowLabelKey(rowId: AthleteTableRowId): string {
  return `athleteTableRow_${rowId}`;
}

function pickLabelKey(rowId: AthleteTableRowId, pick: string): string {
  return `athleteTablePick_${rowId}_${pick.replace(/-/g, '_')}`;
}

const ROW_DEFAULTS: Record<AthleteTableRowId, string> = {
  trainingStyle: 'Training style',
  homeGym: 'Home gym',
  goToLift: 'Go-to lift',
  workingOn: 'Currently working on',
};

const PICK_DEFAULTS: Record<string, string> = {
  strength: 'Strength',
  hybrid: 'Hybrid',
  conditioning: 'Conditioning',
  bodyweight: 'Bodyweight',
  power: 'Power',
  'full-gym': 'Full gym',
  'rack-bars': 'Rack + bars',
  dumbbells: 'Dumbbells',
  bands: 'Bands',
  'bodyweight-only': 'Bodyweight only',
  travel: 'Hotel / travel',
  squat: 'Squat',
  deadlift: 'Deadlift',
  bench: 'Bench',
  press: 'Press',
  'pull-up': 'Pull-up',
  row: 'Row',
  'other-compound': 'Other compound',
  hypertrophy: 'Hypertrophy',
  skill: 'Skill',
  consistency: 'Consistency',
  comeback: 'Comeback',
};

export function AthleteTableCard() {
  const { t } = useTranslation();
  const [table, setTable] = useState<AthleteTablePicks>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const reload = () => {
      setTable(loadAthletePageConfig().table);
    };
    reload();
    window.addEventListener(ATHLETE_PAGE_CHANGED, reload);
    return () => window.removeEventListener(ATHLETE_PAGE_CHANGED, reload);
  }, []);

  const setPick = (rowId: AthleteTableRowId, value: string) => {
    setTable((prev) => ({ ...prev, [rowId]: value === '' ? null : value }));
    setSaved(false);
  };

  const commit = () => {
    const current = loadAthletePageConfig();
    const next: AthletePageConfig = {
      ...current,
      table: { ...current.table, ...table },
    };
    saveAthletePageConfig(next);
    setTable(loadAthletePageConfig().table);
    setSaved(true);
  };

  const pickText = (rowId: AthleteTableRowId): string => {
    const value = table[rowId];
    if (typeof value !== 'string' || !value) {
      return t('athleteTableUnset', { defaultValue: '—' });
    }
    return t(pickLabelKey(rowId, value), { defaultValue: PICK_DEFAULTS[value] ?? value });
  };

  return (
    <div className="house-card space-y-3" data-testid="athlete-table-card">
        <p className="eyebrow mb-1">{t('athleteTableTitle', { defaultValue: 'About training' })}</p>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('athleteTableBody', {
            defaultValue: 'Who you are as an athlete — picks only, stays on this device.',
          })}
        </p>

        <dl className="space-y-3" data-testid="athlete-table-display">
          {ATHLETE_TABLE_ROWS.map((row) => {
            const rowId = row.id as AthleteTableRowId;
            return (
              <div
                key={rowId}
                className="grid gap-1 border-t-2 border-border pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t(rowLabelKey(rowId), { defaultValue: ROW_DEFAULTS[rowId] })}
                </dt>
                <dd className="text-sm font-semibold text-foreground">{pickText(rowId)}</dd>
              </div>
            );
          })}
        </dl>

        <details className="group mt-5 border-t-2 border-border pt-4">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            {t('athleteTableEdit', { defaultValue: 'Edit table' })}
          </summary>
          <div className="mt-3">
            <dl className="space-y-4">
              {ATHLETE_TABLE_ROWS.map((row) => {
                const rowId = row.id as AthleteTableRowId;
                const value = table[rowId] ?? '';
                return (
                  <div key={rowId} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-3">
                    <dt className="text-xs font-semibold text-muted-foreground">
                      {t(rowLabelKey(rowId), { defaultValue: ROW_DEFAULTS[rowId] })}
                    </dt>
                    <dd>
                      <select
                        id={`athlete-table-${rowId}`}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => setPick(rowId, e.target.value)}
                        className="min-h-[44px] w-full max-w-md rounded-none border border-border bg-background px-3 text-sm tap-target"
                        aria-label={t(rowLabelKey(rowId), { defaultValue: ROW_DEFAULTS[rowId] })}
                      >
                        <option value="">
                          {t('athleteTableUnset', { defaultValue: '—' })}
                        </option>
                        {picksForRow(rowId).map((pick) => (
                          <option key={pick} value={pick}>
                            {t(pickLabelKey(rowId, pick), {
                              defaultValue: PICK_DEFAULTS[pick] ?? pick,
                            })}
                          </option>
                        ))}
                      </select>
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-5">
              <Button type="button" variant="outline" onClick={commit} className="tap-target min-h-[44px]">
                {t('athleteTableSave', { defaultValue: 'Save' })}
              </Button>
              {saved && (
                <p className="mt-2 text-sm text-muted-foreground" role="status">
                  {t('athleteTableSaved', { defaultValue: 'Saved on this device.' })}
                </p>
              )}
            </div>
          </div>
        </details>
    </div>
  );
}
