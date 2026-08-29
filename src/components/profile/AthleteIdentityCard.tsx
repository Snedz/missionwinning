'use client';
/**
 * Who you are, on your own page.
 *
 * The call sign already existed — `operatorName`, 24 chars, in
 * `leaderboard/computeLocalStats.ts` — but the only place to set it was a field
 * on `/leaderboard`, a parkable surface most athletes never open. Identity was
 * therefore editable only from the one screen that ranks people, which is
 * exactly backwards for a product whose whole social thesis is
 * profile-not-feed (docs/IDENTITY_SOCIAL_PLAN.md).
 *
 * **S2.5** adds the call-sign number (00–99, CLUB_PLAN Athlete Card) and a
 * derived signature line so the first viewport reads as a person, not a
 * settings remnant. Number is picks-from-set, stored with card cosmetics,
 * always available (not tier-gated). Signature is career counts only — never
 * rank or XP (C4 spirit on-surface).
 *
 * Storage is unchanged and shared for the name: `saveOperatorName` is still the
 * single writer. Number rides `athleteCard` config so share and this editor
 * cannot drift.
 *
 * **No red action.** This is a record, not a task — red means "do this now"
 * (DESIGN_REVIEW colour semantics), and a name field never does. The Save is an
 * outline button, which is what pins `/profile` at a red-action cap of 0.
 *
 * **The verdict is shown, never swallowed.** `.611` made `saveOperatorName`
 * return a `DisplayNameCheck` — it rejects impersonation, links and bidi/control
 * characters before a name can reach a board. An editor that discards that return
 * value looks like it saved and did not: the field snaps back to the old name with
 * no reason given, which is the worst version of a validated field. Each rejection
 * reason gets its own line.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadOperatorName, saveOperatorName } from '@/lib/leaderboard/computeLocalStats';
import { DISPLAY_NAME_MAX, type DisplayNameRejection } from '@/lib/identity/displayName';
import {
  ATHLETE_CARD_CHANGED,
  clampCallSignNumber,
  formatAthleteCardTitle,
  formatCallSignNumber,
  loadAthleteCardConfig,
  saveAthleteCardConfig,
  type AthleteCardConfig,
} from '@/lib/identity/athleteCard';
import { formatLocalDateKey } from '@/lib/time/localDate';
import { formatLocalNumber } from '@/lib/i18n/formatLocale';
import { careerSignature, type CareerLine } from '@/lib/careerLine';

const NUMBER_OPTIONS: number[] = Array.from({ length: 100 }, (_, i) => i);

export function AthleteIdentityCard({ career }: { career: CareerLine }) {
  // `i18n.language`, never the ambient locale — `localeFormat.test.ts` discovers
  // any `toLocale*`/`Intl` call that omits it, and a date on an identity page is
  // exactly the kind of number that renders wrong for a whole timezone band.
  const { t, i18n } = useTranslation();
  const [callSign, setCallSign] = useState('');
  const [number, setNumber] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [rejection, setRejection] = useState<DisplayNameRejection | null>(null);

  // localStorage is client-only; reading during render would differ between the
  // server pass and the first client pass. Also re-read when the card editor
  // writes cosmetics so a shared number cannot fork across the two cards.
  useEffect(() => {
    const reload = () => {
      setCallSign(loadOperatorName());
      setNumber(clampCallSignNumber(loadAthleteCardConfig().callSignNumber));
    };
    reload();
    window.addEventListener(ATHLETE_CARD_CHANGED, reload);
    return () => window.removeEventListener(ATHLETE_CARD_CHANGED, reload);
  }, []);

  const sig = useMemo(() => careerSignature(career), [career]);
  const heroTitle = formatAthleteCardTitle(callSign, number);
  const hasName = callSign.trim().length > 0;

  const commit = () => {
    const verdict = saveOperatorName(callSign);
    if (!verdict.ok) {
      setRejection(verdict.reason ?? 'unsafe-characters');
      setSaved(false);
      return;
    }
    setRejection(null);
    setCallSign(loadOperatorName());

    const next: AthleteCardConfig = {
      ...loadAthleteCardConfig(),
      callSignNumber: clampCallSignNumber(number),
    };
    saveAthleteCardConfig(next);
    setNumber(clampCallSignNumber(next.callSignNumber));
    setSaved(true);
  };

  const rejectionText = (reason: DisplayNameRejection) => {
    switch (reason) {
      case 'empty':
        return t('athleteIdentityRejectEmpty', { defaultValue: 'Pick a call sign first.' });
      case 'too-long':
        return t('athleteIdentityRejectLong', { defaultValue: 'Too long — 24 characters at most.' });
      case 'reserved':
        return t('athleteIdentityRejectReserved', {
          defaultValue: 'That one reads as the app or its staff. Pick something that is yours.',
        });
      case 'link':
        return t('athleteIdentityRejectLink', { defaultValue: 'No links or addresses in a call sign.' });
      default:
        return t('athleteIdentityRejectUnsafe', {
          defaultValue: 'That contains characters that break a shared list. Try letters and numbers.',
        });
    }
  };

  const n = (value: number) => formatLocalNumber(value, i18n.language);

  return (
    /*
     * Field manual (hero-feel A) on You: first viewport is the person — eyebrow,
     * display title, signature. Editors live under a disclosure so the page
     * reads as authored identity, not a settings form. Save stays outline (0 red).
     */
    <div className="house-card space-y-3" data-testid="athlete-identity-card">
        <p className="eyebrow text-primary">
          {t('athleteIdentityTitle', { defaultValue: 'Call sign' })}
        </p>

        <p
          className="display-section text-foreground"
          data-testid="athlete-identity-hero"
        >
          {hasName
            ? heroTitle
            : t('athleteIdentityHeroEmpty', { defaultValue: 'Pick a call sign' })}
        </p>

        {sig ? (
          <p className="house-identity-cite" data-testid="athlete-signature">
            {t('careerSignature', {
              sessions: n(sig.sessions),
              bestWeek: n(sig.bestWeek),
              days: n(sig.daysTrained),
              defaultValue: `${n(sig.sessions)} sessions · best week ${n(sig.bestWeek)} · ${n(sig.daysTrained)} days`,
            })}
          </p>
        ) : (
          <p className="house-identity-cite">
            {t('athleteIdentityNoStart', {
              defaultValue: 'Your first logged session starts the record.',
            })}
          </p>
        )}

        {career.firstSessionOn && (
          <p className="house-identity-cite">
            {t('athleteIdentitySince', {
              date: formatLocalDateKey(career.firstSessionOn, i18n.language),
              defaultValue: `Training here since ${formatLocalDateKey(career.firstSessionOn, i18n.language)}`,
            })}
          </p>
        )}

        <details className="group house-identity-edit" data-testid="athlete-identity-edit">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            {t('athleteIdentityEdit', { defaultValue: 'Edit call sign' })}
          </summary>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <label
                  htmlFor="athlete-call-number"
                  className="house-identity-number-label"
                  data-testid="athlete-identity-number-label"
                >
                  {t('athleteIdentityNumber', { defaultValue: 'Number' })}
                </label>
                <select
                  id="athlete-call-number"
                  value={number === null ? '' : String(number)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNumber(v === '' ? null : clampCallSignNumber(v));
                    setSaved(false);
                  }}
                  className="min-h-[44px] min-w-[5.5rem] rounded-none border-2 border-border bg-background px-3 text-sm tabular-nums tap-target"
                  aria-label={t('athleteIdentityNumber', { defaultValue: 'Number' })}
                >
                  <option value="">
                    {t('athleteIdentityNumberNone', { defaultValue: '—' })}
                  </option>
                  {NUMBER_OPTIONS.map((opt) => (
                    <option key={opt} value={String(opt)}>
                      {formatCallSignNumber(opt)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[12rem] flex-1 space-y-1">
                <label
                  htmlFor="athlete-call-sign"
                  className="house-identity-name-label"
                  data-testid="athlete-identity-name-label"
                >
                  {t('athleteIdentityNameLabel', { defaultValue: 'Name' })}
                </label>
                <Input
                  id="athlete-call-sign"
                  value={callSign}
                  maxLength={DISPLAY_NAME_MAX}
                  onChange={(e) => {
                    setCallSign(e.target.value);
                    setSaved(false);
                    setRejection(null);
                  }}
                  onBlur={commit}
                  className="max-w-none"
                />
              </div>

              <Button variant="outline" onClick={commit} className="tap-target min-h-[44px]">
                {t('athleteIdentitySave', { defaultValue: 'Save' })}
              </Button>
            </div>

            {rejection && (
              <p className="text-sm text-primary" role="alert">
                {rejectionText(rejection)}
              </p>
            )}

            {saved && (
              <p className="text-sm text-muted-foreground" role="status">
                {t('athleteIdentitySaved', { defaultValue: 'Saved on this device.' })}
              </p>
            )}
          </div>
        </details>
    </div>
  );
}
