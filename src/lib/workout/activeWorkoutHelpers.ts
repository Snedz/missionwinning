/**
 * Pure helpers for the active workout logger (no React / store).
 * Consumers: ActiveWorkoutPage, unit tests.
 *
 * Split behind this barrel (`.1106`): `activeSessionView` · `activeDial` ·
 * `activeConsole` · `activeMenuGates`. Import paths stay here.
 */
export {
  findNextSet,
  sessionIsCoachPrescribed,
  sessionSetStats,
  bodyScoreDeltas,
  activeSessionBottomClass,
  resolveActiveGoalId,
  activeSessionHasExercises,
  activePostSessionPath,
  sessionSetsProgressPct,
  activeCoachTipKind,
  toggleOpenIdx,
  isOpenIdx,
  exerciseHasCompletedSet,
  laterLiftVisible,
  exerciseHasPlannedSet,
  firstPlannedSetIdx,
  holdsActiveExercise,
  isActiveSetCell,
  activeSetIdxForExercise,
} from '@/lib/workout/activeSessionView';
export type {
  BodyScoreTriple,
  ActivePostSessionPath,
  ActiveCoachTipKind,
} from '@/lib/workout/activeSessionView';
export {
  getLastSessionSets,
  getLastPerformanceForSet,
  lastWorkingForDial,
  formatPrevSetLabels,
  setInputKey,
  priorCompletedInExercise,
  resolveSetInput,
  formatLoggedSetLine,
  nextSetInput,
  planApplyTargets,
  resolveActiveSetDial,
  resolveRepeatLastTarget,
  resolveExerciseNextTarget,
} from '@/lib/workout/activeDial';
export type { ExerciseNextTarget } from '@/lib/workout/activeDial';
export {
  rankSwapCandidates,
  buildConsoleSet,
  resolveActiveDockMode,
  resolveFormGuideSheet,
  resolveSwapCandidatesWhenOpen,
} from '@/lib/workout/activeConsole';
export type {
  ConsoleSetKind,
  ConsoleSetView,
  ActiveDockMode,
} from '@/lib/workout/activeConsole';
export {
  shouldOfferVolumeTrim,
  shouldShowReadinessDelta,
  shouldShowVolumeTrimOffer,
  shouldShowSetOptionsFooter,
  shouldShowApplyTargetsMenuitem,
  shouldShowRemoveSetMenuitem,
  exerciseHasWeightedSet,
  firstWeightedLoad,
  shouldShowLoadPctChip,
  shouldShowSupersetLinkMenuitem,
  shouldShowExerciseSwapMenuitem,
  shouldShowSessionSkip,
} from '@/lib/workout/activeMenuGates';
