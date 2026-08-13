'use client';
/**
 * The Athlete Card — the identity surface `/profile` never had (`.610`).
 *
 * `.698` makes the preview the artifact: token frame/backdrop classes, career
 * signature (never rank/XP), cosmetics and card-share PNG behind a disclosure
 * so the page reads as authored, not as a settings form.
 *
 * Customization is **picks-from-sets** — no free text, no uploads.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { summarizeRewards, ownedBadgeDefs } from '@/lib/rewards/summary';
import { loadOperatorName } from '@/lib/leaderboard/computeLocalStats';
import {
  ATHLETE_CARD_CHANGED,
  buildAthleteCardData,
  formatAthleteCardTitle,
  loadAthleteCardConfig,
  saveAthleteCardConfig,
  tierForLevel,
  type AthleteCardConfig,
} from '@/lib/identity/athleteCard';
import {
  ATHLETE_PAGE_CHANGED,
  ATHLETE_TABLE_ROWS,
  loadAthletePageConfig,
  type AthleteTablePicks,
  type AthleteTableRowId,
} from '@/lib/identity/athleteProfile';
import {
  badgeSlots,
  unlockedBackdrops,
  unlockedFrames,
  type CardBackdropId,
  type CardFrameId,
} from '../../../packages/mw-core/src/identity/athleteCard';
import { renderShareCard, shareCardImage } from '@/lib/share/shareCard';
import { careerSignature, type CareerLine } from '@/lib/careerLine';
import { formatLocalNumber } from '@/lib/i18n/formatLocale';
import { cn } from '@/lib/utils';

const FRAME_LABEL: Record<CardFrameId, string> = {
  hairline: 'Hairline',
  rule: 'Rule',
  'double-rule': 'Double rule',
  poster: 'Poster',
};

const BACKDROP_LABEL: Record<CardBackdropId, string> = {
  paper: 'Paper',
  grid: 'Grid',
  'rule-field': 'Rule field',
  'poster-block': 'Poster block',
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

function pickLabelKey(rowId: AthleteTableRowId, pick: string): string {
  return `athleteTablePick_${rowId}_${pick.replace(/-/g, '_')}`;
}

function previewClassName(config: AthleteCardConfig): string {
  const frame = `athlete-card-preview--frame-${config.frame}`;
  const backdrop = `athlete-card-preview--backdrop-${config.backdrop}`;
  return cn('athlete-card-preview', frame, backdrop);
}

export function ProfileAthleteCard({ career }: { career: CareerLine }) {
  const { t, i18n } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const summary = useMemo(() => summarizeRewards(workoutHistory), [workoutHistory]);
  const [config, setConfig] = useState<AthleteCardConfig>(() => loadAthleteCardConfig());
  const [operatorName, setOperatorName] = useState('');
  const [table, setTable] = useState<AthleteTablePicks>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const reload = () => {
      setConfig(loadAthleteCardConfig());
      setOperatorName(loadOperatorName());
      setTable(loadAthletePageConfig().table);
    };
    reload();
    window.addEventListener(ATHLETE_CARD_CHANGED, reload);
    window.addEventListener(ATHLETE_PAGE_CHANGED, reload);
    return () => {
      window.removeEventListener(ATHLETE_CARD_CHANGED, reload);
      window.removeEventListener(ATHLETE_PAGE_CHANGED, reload);
    };
  }, []);

  const tier = tierForLevel(summary.level);
  const frames = unlockedFrames(tier);
  const backdrops = unlockedBackdrops(tier);
  const slots = badgeSlots(tier);
  const owned = ownedBadgeDefs(summary.badges);

  const update = (next: AthleteCardConfig) => {
    setConfig(next);
    saveAthleteCardConfig(next);
  };

  const toggleBadge = (id: string) => {
    const has = config.badges.includes(id);
    const badges = has
      ? config.badges.filter((b) => b !== id)
      : [...config.badges, id].slice(-slots);
    update({ ...config, badges });
  };

  const onShare = async () => {
    setBusy(true);
    try {
      const data = buildAthleteCardData(summary, loadOperatorName());
      const blob = await renderShareCard(data);
      if (blob) {
        await shareCardImage(
          blob,
          t('athleteCardShareText', { defaultValue: 'On the path.' }),
          'https://www.missionwinning.com',
          'mission-winning-card.png'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const previewTitle = formatAthleteCardTitle(operatorName, config.callSignNumber);
  const sig = careerSignature(career);
  const n = (value: number) => formatLocalNumber(value, i18n.language);
  const shownBadges = owned.filter((b) => config.badges.includes(b.id));
  const tableBits = ATHLETE_TABLE_ROWS.map((row) => {
    const rowId = row.id as AthleteTableRowId;
    const pick = table[rowId];
    if (typeof pick !== 'string' || !pick) return null;
    return t(pickLabelKey(rowId, pick), { defaultValue: PICK_DEFAULTS[pick] ?? pick });
  }).filter((v): v is string => Boolean(v));

  const inner = (
    <>
      <p className="eyebrow text-primary">
        {t('athleteCardPreviewKicker', { defaultValue: 'On the path' })}
      </p>
      <p className="mt-2 text-xl font-extrabold tracking-tight">{previewTitle}</p>
      {sig ? (
        <p className="mt-1 text-sm text-muted-foreground" data-testid="athlete-card-signature">
          {t('careerSignature', {
            sessions: n(sig.sessions),
            bestWeek: n(sig.bestWeek),
            days: n(sig.daysTrained),
            defaultValue: `${n(sig.sessions)} sessions · best week ${n(sig.bestWeek)} · ${n(sig.daysTrained)} days`,
          })}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground" data-testid="athlete-card-signature">
          {t('athleteCardPreviewEmpty', {
            defaultValue: 'Log a session and the card fills from your record.',
          })}
        </p>
      )}
      {tableBits.length > 0 && (
        <p className="mt-2 text-sm text-foreground">{tableBits.join(' · ')}</p>
      )}
      {shownBadges.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {shownBadges.map((b) => t(b.titleKey, { defaultValue: b.titleDefault })).join(' · ')}
        </p>
      )}
    </>
  );

  return (
    <Card className="bg-card" data-testid="athlete-card-editor">
      <CardContent className="space-y-4 pt-6">
        <p className="eyebrow text-primary">
          {t('athleteCardTitle', { defaultValue: 'Your card' })}
        </p>
        <div
          className={previewClassName(config)}
          data-testid="athlete-card-preview"
          data-card-frame={config.frame}
          data-card-backdrop={config.backdrop}
          aria-hidden="true"
        >
          {config.frame === 'double-rule' ? (
            <div className="border-2 border-foreground p-3">{inner}</div>
          ) : (
            inner
          )}
        </div>

        <details className="group border-t-2 border-border pt-4">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            {t('athleteCardEdit', { defaultValue: 'Edit card' })}
          </summary>
          <div className="mt-3 space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('athleteCardFrame', { defaultValue: 'Frame' })}
              </legend>
              <div className="flex flex-wrap gap-2">
                {frames.map((f) => (
                  <Button
                    key={f}
                    type="button"
                    variant={config.frame === f ? 'selected' : 'outline'}
                    className="min-h-[44px] tap-target"
                    aria-pressed={config.frame === f}
                    onClick={() => update({ ...config, frame: f })}
                  >
                    {FRAME_LABEL[f]}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('athleteCardBackdrop', { defaultValue: 'Backdrop' })}
              </legend>
              <div className="flex flex-wrap gap-2">
                {backdrops.map((b) => (
                  <Button
                    key={b}
                    type="button"
                    variant={config.backdrop === b ? 'selected' : 'outline'}
                    className="min-h-[44px] tap-target"
                    aria-pressed={config.backdrop === b}
                    onClick={() => update({ ...config, backdrop: b })}
                  >
                    {BACKDROP_LABEL[b]}
                  </Button>
                ))}
              </div>
            </fieldset>

            {owned.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('athleteCardBadges', {
                    slots,
                    defaultValue: `Badges — pick up to ${slots}`,
                  })}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {owned.map((b) => (
                    <Button
                      key={b.id}
                      type="button"
                      variant={config.badges.includes(b.id) ? 'selected' : 'outline'}
                      className="min-h-[44px] tap-target"
                      aria-pressed={config.badges.includes(b.id)}
                      onClick={() => toggleBadge(b.id)}
                    >
                      {b.titleDefault}
                    </Button>
                  ))}
                </div>
              </fieldset>
            )}

            <Button type="button" variant="outline" size="block" onClick={onShare} disabled={busy}>
              <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {busy
                ? t('athleteCardSharing', { defaultValue: 'Preparing…' })
                : t('athleteCardShare', { defaultValue: 'Share your card' })}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('athleteCardPrivacy', {
                defaultValue:
                  'Rendered on this device and shared only if you send it. Nothing is uploaded.',
              })}
            </p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
