'use client';
/**
 * Page kit picker — curated composition, not a stylesheet (C6).
 *
 * Unlocks follow the same tier ladder as card frames. Locked kits are listed
 * but not selectable, so the athlete sees what training opens without a shop.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { summarizeRewards } from '@/lib/rewards/summary';
import { tierForLevel } from '@/lib/identity/athleteCard';
import {
  ATHLETE_PAGE_CHANGED,
  loadAthletePageConfig,
  PAGE_KITS,
  saveAthletePageConfig,
  unlockedPageKits,
  type AthletePageConfig,
} from '@/lib/identity/athleteProfile';

const KIT_LABEL_DEFAULT: Record<string, string> = {
  default: 'Stack',
  field: 'Field',
  ledger: 'Ledger',
  poster: 'Poster',
};

export function AthletePageKitCard() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const summary = useMemo(() => summarizeRewards(workoutHistory), [workoutHistory]);
  const tier = tierForLevel(summary.level);
  const unlocked = useMemo(() => unlockedPageKits(tier), [tier]);
  const unlockedIds = useMemo(() => new Set(unlocked.map((k) => k.id)), [unlocked]);

  const [kitId, setKitId] = useState('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const reload = () => setKitId(loadAthletePageConfig().kitId);
    reload();
    window.addEventListener(ATHLETE_PAGE_CHANGED, reload);
    return () => window.removeEventListener(ATHLETE_PAGE_CHANGED, reload);
  }, []);

  const pick = (id: string) => {
    if (!unlockedIds.has(id)) return;
    setKitId(id);
    const current = loadAthletePageConfig();
    const next: AthletePageConfig = { ...current, kitId: id };
    saveAthletePageConfig(next);
    setSaved(true);
  };

  return (
    <div className="house-card space-y-3" data-testid="athlete-page-kit-card">
        <details className="group">
          <summary
            className="house-kit-summary flex min-h-[44px] cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden"
            data-testid="athlete-kit-summary"
          >
            {t('athleteKitTitle', { defaultValue: 'Page kit' })}
          </summary>
          <div className="mt-3">
        <p className="house-kit-cite" data-testid="athlete-kit-cite">
          {t('athleteKitBody', {
            defaultValue: 'How this page is laid out. Training unlocks more kits.',
          })}
        </p>

        <div className="flex flex-wrap gap-2">
          {PAGE_KITS.map((kit) => {
            const open = unlockedIds.has(kit.id);
            const selected = kitId === kit.id;
            return (
              <Button
                key={kit.id}
                type="button"
                variant={selected ? 'selected' : 'outline'}
                className="min-h-[44px] tap-target"
                disabled={!open}
                aria-pressed={selected}
                aria-label={t(`athleteKit_${kit.id}`, {
                  defaultValue: KIT_LABEL_DEFAULT[kit.id] ?? kit.id,
                })}
                onClick={() => pick(kit.id)}
              >
                {t(`athleteKit_${kit.id}`, {
                  defaultValue: KIT_LABEL_DEFAULT[kit.id] ?? kit.id,
                })}
                {!open && (
                  <span className="house-kit-locked ml-1" data-testid="athlete-kit-locked">
                    {t('athleteKitLocked', {
                      tier: kit.minTier,
                      defaultValue: `T${kit.minTier}`,
                    })}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {saved && (
          <p className="house-kit-saved" data-testid="athlete-kit-saved" role="status">
            {t('athleteKitSaved', { defaultValue: 'Layout saved on this device.' })}
          </p>
        )}
          </div>
        </details>
    </div>
  );
}
