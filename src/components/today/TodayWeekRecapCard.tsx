'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import type { WeekRecap } from '@/lib/weekRecap';
import { impactLine } from '@/lib/journal/impacts';
import { behaviorImpactLine, collectingLine } from '@/lib/journal/behaviorImpacts';
import { useTodayDigest } from '@/hooks/useTodayDigest';
import { track } from '@/lib/analytics';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { getCachedReferralCode } from '@/lib/referral';

type Props = {
 recap: WeekRecap;
};

/** End-of-week debrief + mid-week pulse — retention surface. */
export function TodayWeekRecapCard({ recap }: Props) {
 const { t } = useTranslation();
 const [expanded, setExpanded] = useState(false);
 const [viewed, setViewed] = useState(false);

 /*
  * One read of the day, shared with every other Today card.
  *
  * This component used to call `loadCheckIns()` three times in one render and
  * run `computeBehaviorImpacts` over the result — the same call, with the same
  * arguments, that `TodayDayReviewCard` was making beside it. Per-card memos
  * cached each of those correctly and still ran all of them.
  *
  * `debrief` is null on any day that is not Sunday or Monday: the hook decides
  * that from the date and never imports `weeklyDebrief` otherwise, so a Tuesday
  * no longer downloads and runs the whole module to be told it is not the weekend.
  */
 const { debrief, impacts, establishedBehaviorImpacts, behaviorImpacts } = useTodayDigest();

 /*
  * A `forceFull` prop lived here for dev/QA and had **zero callers anywhere** —
  * the `.195` orphan class, so it is gone rather than carried. `isFullDebrief`
  * is now redundant with `debrief` being non-null at all (the digest only builds
  * it on a debrief day), but it stays read here so the card keeps agreeing with
  * the debrief's own answer rather than inferring it.
  */
 const full = !!debrief?.isFullDebrief;
 const units = useUnits();

 const established = establishedBehaviorImpacts;
 const collecting = behaviorImpacts.filter((i) => i.kind === 'collecting');

 // Week recap as an image — rendered on-device, shared only by choice (.182).
 // The canvas renderer is imported inside the handler: it is one of the largest
 // modules the app has, and nobody pays for it until they tap Share.
 const shareRecapCard = async () => {
 if (!debrief) return;
 const { buildRecapCardData, renderShareCard, shareCardImage } = await import(
 '@/lib/share/shareCard'
 );
 const card = buildRecapCardData(debrief, weightUnitLabel(units));
 const blob = await renderShareCard(card);
 if (!blob) {
 track('share_card_generated', { surface: 'week-recap', method: 'failed' });
 return;
 }
 const refCode = getCachedReferralCode();
 const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.missionwinning.com';
 const shareUrl = refCode
 ? `${origin}/?ref=${encodeURIComponent(refCode)}`
 : `${origin}/?utm_source=share&utm_medium=week-recap`;
 const text = `Week of ${debrief.weekStart}: ${debrief.train.sessions} sessions, ${debrief.train.sets} sets.`;
 const method = await shareCardImage(blob, text, shareUrl);
 track('share_card_generated', { surface: 'week-recap', method });
 };

 useEffect(() => {
 if (full && !viewed) {
 track('weekly_debrief_viewed');
 setViewed(true);
 }
 }, [full, viewed]);

 if (!recap.hasActivity && !recap.isWeekEnd && !full) return null;

 // `!debrief` is the same condition as `!full` — the digest only builds it on a
 // debrief day — but stating it separately is what lets the full layout below
 // read `debrief.train` without a non-null assertion on every line.
 if (!full || !debrief) {
 return (
 <section className="content-card border-border bg-accent-100 p-4 space-y-3">
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-card text-accent-900">
 <CalendarDays className="h-5 w-5" aria-hidden />
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <p className="eyebrow-honor">
 {t('todayWeekRecapTitle', { defaultValue: 'This week' })}
 </p>
 <p className="text-sm text-muted-foreground leading-relaxed">
 {t('todayWeekRecapBody', {
 sessions: recap.sessions,
 sets: recap.totalSets,
 streak: recap.streak,
 defaultValue: recap.hasActivity
 ? `${recap.sessions} sessions · ${recap.totalSets} sets · ${recap.streak}-day streak`
 : 'No sessions yet this week — Just Go keeps the path alive.',
 })}
 </p>
 </div>
 </div>
 <Links />
 </section>
 );
 }

 const focusText = t(debrief.focusKey, {
 ...(debrief.focusParams ?? {}),
 defaultValue: focusDefault(debrief.focusKey, debrief.focusParams?.group),
 });

 return (
 <section className="content-card border-border p-4 space-y-4">
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-card text-accent-900">
 <CalendarDays className="h-5 w-5" aria-hidden />
 </div>
 <div className="min-w-0 flex-1">
 <p className="eyebrow-honor">
 {t('debriefTitle', { defaultValue: 'Mission Debrief' })}
 </p>
 <p className="text-sm text-foreground font-medium mt-0.5">{focusText}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs">
 <PillarStat
 eyebrow={t('debriefTrain', { defaultValue: 'Train' })}
 body={`${debrief.train.sessions} sess · ${debrief.train.sets} sets`}
 />
 <PillarStat
 eyebrow={t('debriefFuel', { defaultValue: 'Fuel' })}
 body={`${debrief.fuel.proteinDays} protein days`}
 />
 <PillarStat
 eyebrow={t('debriefMoveMind', { defaultValue: 'Move / Mind' })}
 body={`${debrief.moveMind.flows} flows · ${debrief.moveMind.sessions} check-ins`}
 />
 <PillarStat
 eyebrow={t('debriefBody', { defaultValue: 'Body' })}
 body={
 debrief.body?.weightDelta != null
 ? `${debrief.body.weightDelta > 0 ? '+' : ''}${debrief.body.weightDelta} kg`
 : t('debriefBodyNone', { defaultValue: 'No weight logged' })
 }
 />
 </div>

 {impacts.length > 0 ? (
 <div className="space-y-1">
 <p className="eyebrow text-[9px] text-muted-foreground">
 {t('debriefImpacts', { defaultValue: 'Impacts' })}
 </p>
 {impacts.slice(0, 2).map((impact) => (
 <p key={impact.factor} className="text-xs text-muted-foreground tabular-nums leading-relaxed">
 {impactLine(impact)}
 </p>
 ))}
 </div>
 ) : null}

 {established.length > 0 || collecting.length > 0 ? (
 <div className="space-y-1">
 <p className="eyebrow text-[9px] text-muted-foreground">
 {t('debriefBehaviorImpacts', { defaultValue: 'Behaviors' })}
 </p>
 {established.slice(0, 2).map((impact) => (
 <p key={impact.factor} className="text-xs text-muted-foreground tabular-nums leading-relaxed">
 {impact.kind === 'established' ? behaviorImpactLine(impact) : null}
 </p>
 ))}
 {/* One "still collecting" line at most. Showing the progress rather than
 hiding it is the credibility — it says what the claim will be built
 from, before any claim exists. */}
 {established.length === 0 && collecting[0]?.kind === 'collecting' ? (
 <p className="text-xs text-muted-foreground tabular-nums leading-relaxed">
 {collectingLine(collecting[0])}
 </p>
 ) : null}
 </div>
 ) : null}

 {/*
  * `.223` — the "N PR marks this week" row is gone. It read `debrief.train.prs`,
  * sourced from a field nothing has ever written, so the condition was
  * permanently false and this row has never rendered for anyone. It comes back
  * when `isPr` survives session completion — `CompletedWorkoutLog` drops it today.
  */}

 <button
 type="button"
 className="flex items-center gap-1 text-xs text-primary"
 onClick={() => setExpanded((e) => !e)}
 >
 {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
 {expanded
 ? t('debriefCollapse', { defaultValue: 'Less' })
 : t('debriefExpand', { defaultValue: 'Details' })}
 </button>

 {expanded ? (
 <p className="text-xs text-muted-foreground leading-relaxed">
 {t('debriefDetails', {
 volume: Math.round(debrief.train.volume),
 defaultValue: `Training volume ~${Math.round(debrief.train.volume)}. Focus next week on the note above — honest, not automatic.`,
 })}
 </p>
 ) : null}

 <div className="flex items-center gap-2">
 <Links />
 <span className="text-muted-foreground text-xs" aria-hidden>·</span>
 <button
 type="button"
 onClick={shareRecapCard}
 className="text-xs font-medium text-primary hover:underline underline-offset-4"
 >
 {t('todayWeekRecapShareCard', { defaultValue: 'Share card' })}
 </button>
 </div>
 </section>
 );
}

function PillarStat({ eyebrow, body }: { eyebrow: string; body: string }) {
 return (
 <div className="border-2 border-border bg-background p-2.5">
 <div className="eyebrow text-[9px] text-muted-foreground mb-0.5">{eyebrow}</div>
 <div className="tabular-nums text-foreground font-medium">{body}</div>
 </div>
 );
}

function Links() {
 const { t } = useTranslation();
 return (
 <div className="flex flex-wrap gap-2">
 <Link
 href="/coach"
 className="text-xs font-medium text-primary hover:underline underline-offset-4"
 >
 {t('todayWeekRecapCoach', { defaultValue: 'Open AI weekly plan' })}
 </Link>
 <span className="text-muted-foreground text-xs">·</span>
 <Link
 href="/history"
 className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
 >
 {t('todayWeekRecapHistory', { defaultValue: 'History' })}
 </Link>
 <span className="text-muted-foreground text-xs">·</span>
 <Link
 href="/track"
 className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
 >
 {t('debriefTrackLink', { defaultValue: 'Body metrics' })}
 </Link>
 </div>
 );
}

function focusDefault(key: string, group?: string): string {
 switch (key) {
 case 'debriefFocusGetOneSession':
 return 'Priority: get one quality session logged this week.';
 case 'debriefFocusUndertrained':
 return `Priority: hit ${group ?? 'undertrained'} next — longest rest group.`;
 case 'debriefFocusDeloadWatch':
 return 'High streak — watch strain; consider an easier day.';
 case 'debriefFocusFuelProtein':
 return 'Training is on — lock protein logging more days.';
 default:
 return 'Keep the consistency you earned.';
 }
}
