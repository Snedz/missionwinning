'use client';
/**
 * Page: /leaderboard — boards and class standings
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Trophy, RefreshCw, Moon, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { getUser } from '@/lib/supabase';
import { buildRankedLeaderboard, type ClassLeaderboardRow } from '@/lib/leaderboard/rank';
import {
 computeLocalLeaderboardSnapshot,
 loadOperatorName,
 saveOperatorName,
 loadSquadCode,
 saveSquadCode,
} from '@/lib/leaderboard/computeLocalStats';
import { DISPLAY_NAME_MAX, type DisplayNameRejection } from '@/lib/identity/displayName';
import { fetchCloudLeaderboardSnapshots, pushLeaderboardSnapshot } from '@/lib/leaderboardSync';
import type { LeaderboardBoardId, LeaderboardScope } from '@/lib/leaderboard/types';
import { parseLeaderboardBoardId, parseLeaderboardScope } from '@/lib/leaderboard/types';
import { BOARD_I18N_KEY } from '@/i18n/leaderboardLocales';
import { LeaderboardBoardPicker } from '@/components/leaderboard/LeaderboardBoardPicker';
import { LeaderboardScopeTabs } from '@/components/leaderboard/LeaderboardScopeTabs';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getJoinedClassCode, getTeacherPin } from '@/lib/schoolClass';
import { visibleLeaderboardScopes } from '@/lib/leaderboard/boards';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';

export function LeaderboardPage() {
 const { t } = useTranslation();
 const fmt = useLocaleFormat();
 const router = useRouter();
 const searchParams = useSearchParams();
 const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
 const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);

 const [boardId, setBoardId] = useState<LeaderboardBoardId>(() => {
 return parseLeaderboardBoardId(searchParams.get('board')) ?? 'mission-score';
 });
 const [scope, setScope] = useState<LeaderboardScope>(() => {
     const requested = parseLeaderboardScope(searchParams.get('scope')) ?? 'global';
     const allowed = new Set(visibleLeaderboardScopes().map((s) => s.id));
     return allowed.has(requested) ? requested : 'global';
   });
 const [cloud, setCloud] = useState<Awaited<ReturnType<typeof fetchCloudLeaderboardSnapshots>>>([]);
 const [classRows, setClassRows] = useState<ClassLeaderboardRow[]>([]);
 const [classCode, setClassCode] = useState('');
 const [operatorName, setOperatorName] = useState(loadOperatorName);
 const [nameError, setNameError] = useState<DisplayNameRejection | null>(null);
 const [squadCode, setSquadCode] = useState(loadSquadCode);
 const [syncing, setSyncing] = useState(false);
 const [loadError, setLoadError] = useState(false);
 const [userId, setUserId] = useState<string | undefined>();

 const refresh = useCallback(async () => {
 setSyncing(true);
 setLoadError(false);
 try {
 const u = await getUser();
 setUserId(u?.id);
 await pushLeaderboardSnapshot(
 computeLocalLeaderboardSnapshot(workoutHistory, savedWorkouts.length)
 );
 const rows = await fetchCloudLeaderboardSnapshots(boardId);
 setCloud(rows);
 const joined = getJoinedClassCode();
 const activeClass = scope === 'class' ? classCode || joined : joined;
 if (scope === 'class' && activeClass) {
 setClassCode(activeClass);
 try {
 const pin = getTeacherPin(activeClass);
 const headers: HeadersInit = pin ? { 'x-teacher-pin': pin } : {};
 const res = await fetch(`/api/school/class/${activeClass}/leaderboard`, {
 credentials: 'include',
 headers,
 });
 if (res.ok) {
 const data = (await res.json()) as {
 entries?: Array<{
 rank: number;
 athleteId?: string;
 userId?: string;
 athleteLabel: string;
 bestTier: string;
 score: number;
 }>;
 };
 setClassRows(
 (data.entries ?? []).map((e) => ({
 rank: e.rank,
 userId: e.athleteId ?? e.userId ?? '',
 athleteLabel: e.athleteLabel,
 bestTier: e.bestTier,
 score: e.score,
 }))
 );
 } else {
 setLoadError(true);
 setClassRows([]);
 }
 } catch {
 setLoadError(true);
 setClassRows([]);
 }
 } else if (scope !== 'class') {
 setClassRows([]);
 }
 } catch {
 setLoadError(true);
 } finally {
 setSyncing(false);
 }
 }, [workoutHistory, savedWorkouts.length, boardId, scope, classCode]);

 useEffect(() => {
 void refresh();
 }, [refresh]);

 useEffect(() => {
 const joined = getJoinedClassCode();
 if (joined && !loadSquadCode()) {
 saveSquadCode(joined);
 setSquadCode(joined);
 }
 if (joined) setClassCode(joined);
 if (joined && !searchParams.get('scope')) {
 setScope(boardId === 'presidential-fitness' ? 'class' : 'friends');
 }
 }, [searchParams, boardId]);

 useEffect(() => {
 const nextBoard = parseLeaderboardBoardId(searchParams.get('board'));
 const nextScope = parseLeaderboardScope(searchParams.get('scope'));
 const urlClass = searchParams.get('class')?.toUpperCase();
 if (nextBoard) setBoardId(nextBoard);
 if (nextScope) setScope(nextScope);
 if (urlClass) setClassCode(urlClass);
 }, [searchParams]);

 const updateUrl = useCallback(
 (nextBoard: LeaderboardBoardId, nextScope: LeaderboardScope) => {
 const params = new URLSearchParams();
 if (nextBoard !== 'mission-score') params.set('board', nextBoard);
 if (nextScope !== 'global') params.set('scope', nextScope);
 const joined = getJoinedClassCode();
 if (nextScope === 'class' && joined) params.set('class', joined);
 const qs = params.toString();
 router.replace(qs ? `/leaderboard?${qs}` : '/leaderboard', { scroll: false });
 },
 [router]
 );

 const handleBoardChange = useCallback(
 (id: LeaderboardBoardId) => {
 setBoardId(id);
 updateUrl(id, scope);
 },
 [scope, updateUrl]
 );

 const handleScopeChange = useCallback(
 (next: LeaderboardScope) => {
 setScope(next);
 updateUrl(boardId, next);
 },
 [boardId, updateUrl]
 );

 const you = useMemo(
 () =>
 computeLocalLeaderboardSnapshot(workoutHistory, savedWorkouts.length, userId),
 [workoutHistory, savedWorkouts.length, userId]
 );

 const ranked = useMemo(
 () =>
 buildRankedLeaderboard(
 boardId,
 scope,
 { ...you, operatorName, squadCode: squadCode || undefined, userId },
 cloud,
 { classCode: classCode || undefined, classRows }
 ),
 [boardId, scope, you, cloud, operatorName, squadCode, userId, classCode, classRows]
 );

 const boardTheme = ranked.board.theme;
 const boardTitle = t(BOARD_I18N_KEY[boardId], { defaultValue: ranked.board.title });

 return (
 <PillarPageShell
 icon={Trophy}
 eyebrow={t('leaderboardEyebrow', { defaultValue: 'Leaderboard' })}
 title={t('leaderboardTitle', { defaultValue: 'Leaderboard' })}
 subtitle={t('leaderboardSubtitle', {
 defaultValue: 'Optional rankings by region, country, or squad — training first, never required.',
 })}
 showLegalFooter
 className="pb-8"
 headerActions={
 <Button
 variant="outline"
 size="sm"
 className="shrink-0 gap-1.5"
 onClick={() => void refresh()}
 disabled={syncing}
 >
 <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
 {t('leaderboardSync', { defaultValue: 'Sync' })}
 </Button>
 }
 >
 <LeaderboardBoardPicker boardId={boardId} onBoardChange={handleBoardChange} />

 {loadError ? (
 <ErrorState
 title={t('leaderboardLoadError', { defaultValue: 'Could not refresh standings' })}
 description={
 typeof navigator !== 'undefined' && !navigator.onLine
 ? t('leaderboardOffline', {
 defaultValue: 'You appear offline. Local ranks still show below when available.',
 })
 : t('leaderboardLoadErrorDesc', {
 defaultValue: 'Cloud sync failed. Retry when the network is ready.',
 })
 }
 actionLabel={t('retry', { defaultValue: 'Retry' })}
 onAction={() => void refresh()}
 />
 ) : null}

 {(you.nightSessions > 0 || you.dawnSessions > 0) && (
 <div className="flex flex-wrap gap-2 text-xs">
 {you.nightSessions > 0 && (
 <button
 type="button"
 onClick={() => handleBoardChange('under-the-stars')}
 className={cn(
 'inline-flex items-center gap-1.5 border-2 px-3 py-1.5 transition-colors',
 boardId === 'under-the-stars'
 ? 'border-border bg-card text-muted-foreground'
 : 'border-border text-muted-foreground hover:border-foreground'
 )}
 >
 <Moon className="h-3.5 w-3.5" />
 {you.nightSessions}{' '}
 {t('lbNightSessions', { defaultValue: 'night sessions' })}
 </button>
 )}
 {you.dawnSessions > 0 && (
 <button
 type="button"
 onClick={() => handleBoardChange('dawns-early-light')}
 className={cn(
 'inline-flex items-center gap-1.5 border-2 px-3 py-1.5 transition-colors',
 boardId === 'dawns-early-light'
 ? 'border-border bg-muted text-accent-900'
 : 'border-border text-muted-foreground hover:border-foreground'
 )}
 >
 <Sunrise className="h-3.5 w-3.5" />
 {you.dawnSessions}{' '}
 {t('lbDawnSessions', { defaultValue: 'dawn sessions' })}
 </button>
 )}
 </div>
 )}

 <div
 className={
 boardTheme === 'night'
 ? 'border-2 border-border bg-card p-4 md:p-5'
 : boardTheme === 'dawn'
 ? 'border-2 border-border bg-muted p-4 md:p-5'
 : 'border-2 border-border bg-card p-4 md:p-5'
 }
 >
 <h2 className="text-lg font-semibold tracking-tight">{boardTitle}</h2>
 <p className="text-sm text-muted-foreground mt-1">{ranked.board.subtitle}</p>
 {ranked.board.flavor && (
 <p
 className={cn(
 'text-xs mt-3 leading-relaxed border-l-2 pl-3 italic',
 boardTheme === 'night' && 'text-status-info border-border',
 boardTheme === 'dawn' && 'text-accent-900 border-border'
 )}
 >
 {ranked.board.flavor}
 </p>
 )}
 </div>

 <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
 <LeaderboardScopeTabs
 scope={scope}
 onScopeChange={handleScopeChange}
 scopeLabel={ranked.scopeLabel}
 />
 <div className="text-xs text-muted-foreground sm:text-right shrink-0">
 {fmt.num(ranked.totalPlayers)} {t('leaderboardOperators', { defaultValue: 'operators' })}
 {ranked.yourRank != null && (
 <>
 {' · '}
 <span className="text-primary font-semibold">
 {t('leaderboardYourRank', { defaultValue: 'Your rank' })} #{ranked.yourRank}
 </span>
 </>
 )}
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <label className="space-y-1">
 <span className="text-xs text-muted-foreground">
 {/*
 `.610` — "Call sign" → "Name" on the one input other people see. REDTEAM A7
 rates the military register IMPORTANT and notes it is "copy, not architecture
 — cheap to soften"; a visible identity layer is exactly where that stops being
 true. So the shared surface goes neutral while I-Day / Commissioned / Operator
 stay on the athlete's own screens, where they motivate rather than announce.
 */}
 {t('leaderboardDisplayName', { defaultValue: 'Name' })}
 </span>
 <input
 value={operatorName}
 onChange={(e) => setOperatorName(e.target.value)}
 onBlur={() => {
 const verdict = saveOperatorName(operatorName);
 if (!verdict.ok) {
 setNameError(verdict.reason ?? null);
 // Put the stored name back — a rejected edit must not look accepted.
 setOperatorName(loadOperatorName());
 return;
 }
 setNameError(null);
 void refresh();
 }}
 maxLength={DISPLAY_NAME_MAX}
 aria-invalid={nameError !== null}
 aria-describedby={nameError ? 'operator-name-error' : undefined}
 placeholder={t('leaderboardNamePlaceholder', { defaultValue: 'Your name' })}
 className="w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
 />
 {nameError && (
 <p id="operator-name-error" role="status" className="text-xs text-primary">
 {nameError === 'reserved'
 ? t('leaderboardNameReserved', {
 defaultValue: 'That name could be mistaken for Mission Winning staff. Pick another.',
 })
 : nameError === 'link'
 ? t('leaderboardNameLink', { defaultValue: 'Names cannot contain links or addresses.' })
 : nameError === 'too-long'
 ? t('leaderboardNameTooLong', { defaultValue: 'That name is too long.' })
 : nameError === 'empty'
 ? t('leaderboardNameEmpty', { defaultValue: 'Pick a name to show on the board.' })
 : t('leaderboardNameUnsafe', {
 defaultValue: 'That name contains characters we cannot show on a shared board.',
 })}
 </p>
 )}
 </label>
 <label className="space-y-1">
 <span className="text-xs text-muted-foreground">
 {t('leaderboardSquadCode', { defaultValue: 'Squad code (for Squad tab)' })}
 </span>
 <input
 id="leaderboard-squad"
 value={squadCode}
 onChange={(e) => setSquadCode(e.target.value.toUpperCase())}
 onBlur={() => {
 saveSquadCode(squadCode);
 void refresh();
 }}
 maxLength={8}
 placeholder="e.g. ALPHA"
 className="w-full min-h-[44px] border-2 border-border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-foreground"
 />
 </label>
 </div>

 {scope === 'class' && isAmericaTrackEnabled() && !classCode && (
         <EmptyState
           icon={Trophy}
           title={t('leaderboardClassEmptyTitle', { defaultValue: 'Join a PE class' })}
           description={t('leaderboardClassScopeHint', {
             defaultValue:
               'Join a PE class on /america to see class standings here. Class board uses signed-in fitness test results.',
           })}
           actionLabel={t('leaderboardClassEmptyCta', { defaultValue: 'Open America track' })}
           href="/america"
         />
       )}

 {scope === 'friends' && !squadCode && (
 <EmptyState
 icon={Trophy}
 title={t('leaderboardSquadEmptyTitle', { defaultValue: 'Add a squad code' })}
 description={t('leaderboardSquadHint', {
 defaultValue:
 'Enter a code above (try ALPHA or BRAVO for demos).',
 })}
 actionLabel={t('leaderboardSquadEmptyCta', { defaultValue: 'Focus squad code' })}
 onAction={() => document.getElementById('leaderboard-squad')?.focus()}
 />
 )}

 {scope === 'friends' && squadCode.startsWith('MW') && (
 <p className="text-xs text-status-info border-2 border-border bg-card px-3 py-2">
 {t('leaderboardClassHint', {
 defaultValue:
 'PE class code active — squad rankings include classmates who sync while signed in.',
 })}
 </p>
 )}

 <LeaderboardTable
 entries={ranked.entries}
 unit={ranked.board.unit}
 yourRank={ranked.yourRank}
 theme={boardTheme}
 />

 <p className="text-[10px] text-muted-foreground leading-relaxed">
 {scope === 'class'
 ? t('leaderboardClassNote', {
 defaultValue:
 'Class standings rank best signed-in fitness test per athlete. Demo operators are hidden on this board.',
 })
 : t('leaderboardDemoNote', {
 defaultValue:
 'Rows marked Pacer are virtual pace-setters, not real athletes — they keep boards motivating while the community grows. Sign in and tap Sync to publish your score.',
 })}
 </p>
 </PillarPageShell>
 );
}
