'use client';
/**
 * The Athlete Card — the identity surface `/profile` never had (`.610`).
 *
 * Before this, one of nineteen profile cards was identity and the rest were
 * switches. Rank and badges existed but lived in a private trophy case: no avatar,
 * no display name on this page, no way to show anyone what months of training had
 * earned. The one editable expressive string in the whole product was a "Call sign"
 * on a different screen.
 *
 * Wiring only. Tier mapping and the clamp live in `packages/mw-core/.../athleteCard`
 * and the card's data in `src/lib/identity/athleteCard.ts`, both unit-tested —
 * `.598`'s pattern, and it matters here because the interesting behaviour (a locked
 * pick falls back rather than renders, an unowned badge never reaches the PNG) is
 * exactly what a component test would not seed.
 *
 * Customization is **picks-from-sets** — no free text, no uploads. That is what
 * makes it moderation-safe by construction, and it is also what keeps it inside the
 * design system: the unlockables are the system's own vocabulary getting denser, so
 * there is no palette to go off.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IdCard, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  badgeSlots,
  unlockedBackdrops,
  unlockedFrames,
  type CardBackdropId,
  type CardFrameId,
} from '../../../packages/mw-core/src/identity/athleteCard';
import { renderShareCard, shareCardImage } from '@/lib/share/shareCard';

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

export function ProfileAthleteCard() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const summary = useMemo(() => summarizeRewards(workoutHistory), [workoutHistory]);
  const [config, setConfig] = useState<AthleteCardConfig>(() => loadAthleteCardConfig());
  const [operatorName, setOperatorName] = useState('');
  const [busy, setBusy] = useState(false);

  // Identity card writes number/name; this editor writes frames. Same page, two
  // stores of truth — re-read on the shared event so the live preview cannot lie.
  useEffect(() => {
    const reload = () => {
      setConfig(loadAthleteCardConfig());
      setOperatorName(loadOperatorName());
    };
    reload();
    window.addEventListener(ATHLETE_CARD_CHANGED, reload);
    return () => window.removeEventListener(ATHLETE_CARD_CHANGED, reload);
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

  return (
    <Card className="bg-card" data-testid="athlete-card-editor">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          {t('athleteCardTitle', { defaultValue: 'Your card' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/*
          Live preview — the CLUB_PLAN editor pattern (preview on top, picks below).
          Paper/ink poster strip only: no canvas, no share-catalog weight on idle paint.
        */}
        <div
          className="border border-border bg-background p-4"
          data-testid="athlete-card-preview"
          aria-hidden="true"
        >
          <p className="eyebrow text-primary">{t('athleteCardPreviewKicker', { defaultValue: 'On the path' })}</p>
          <p className="mt-2 text-xl font-extrabold tracking-tight">{previewTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('athleteCardBody', {
              rank: summary.rankTitleDefault,
              tier,
              defaultValue: `${summary.rankTitleDefault} · tier ${tier}. Training unlocks more of the card.`,
            })}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t('athleteCardPreviewFrame', {
              frame: FRAME_LABEL[config.frame] ?? config.frame,
              backdrop: BACKDROP_LABEL[config.backdrop] ?? config.backdrop,
              defaultValue: `${FRAME_LABEL[config.frame] ?? config.frame} · ${BACKDROP_LABEL[config.backdrop] ?? config.backdrop}`,
            })}
          </p>
        </div>

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

        {/*
          `outline`, not the default fill: `/profile`'s one red action is "Send
          magic link", and the zero-state cap is one per screen. Shipping this as
          the default variant put a second red on the route and turned
          `zero-state.spec.ts` red — sharing a card is a thing you may do, not the
          thing the screen is asking for.

          `size="block"` rather than `className="w-full"` — it is this system's
          full-width size (h-11, label at the padding edge), and h-11 is also the
          44px the thumb sweep requires. The default h-10 was 4px short.
        */}
        <Button type="button" variant="outline" size="block" onClick={onShare} disabled={busy}>
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {busy
            ? t('athleteCardSharing', { defaultValue: 'Preparing…' })
            : t('athleteCardShare', { defaultValue: 'Share your card' })}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('athleteCardPrivacy', {
            defaultValue: 'Rendered on this device and shared only if you send it. Nothing is uploaded.',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
