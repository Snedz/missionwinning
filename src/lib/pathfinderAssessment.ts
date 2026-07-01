import { backupAssessmentJson } from '@/lib/missionLocalStore';

export type AssessmentRisk = 'low' | 'moderate' | 'high';
export type PathfinderAccess = 'regular' | 'limited' | 'none';
export type ProgramGate = 'standard' | 'low-impact-only';

export interface AssessmentRecord {
  risk: AssessmentRisk;
  notes: string;
  date: string;
  pathfinderAccess?: PathfinderAccess;
  programGate?: ProgramGate;
  pathfinderTrack?: boolean;
}

const STORAGE_ASSESSMENT = 'mw_last_assessment';
const STORAGE_PROGRAM_GATE = 'mw_program_gate';
const STORAGE_PATHFINDER = 'mw_pathfinder_track';

export function countRiskFlags(answers: Record<string, string>): number {
  return Object.values(answers).filter(
    (v) => v.toLowerCase().includes('yes') || v.toLowerCase().includes('low')
  ).length;
}

export function computeAssessmentRisk(yesFlags: number): AssessmentRisk {
  if (yesFlags >= 3) return 'high';
  if (yesFlags >= 1) return 'moderate';
  return 'low';
}

export function isPathfinderSelfManaged(access: PathfinderAccess): boolean {
  return access === 'limited' || access === 'none';
}

export function resolveProgramGate(
  risk: AssessmentRisk,
  pathfinderAccess: PathfinderAccess
): ProgramGate {
  if (risk === 'high' && isPathfinderSelfManaged(pathfinderAccess)) return 'low-impact-only';
  if (risk === 'high') return 'low-impact-only';
  return 'standard';
}

export interface AssessmentResult extends AssessmentRecord {
  recommendations: string[];
}

export function buildAssessmentResult(
  answers: Record<string, string>,
  pathfinderAccess: PathfinderAccess
): AssessmentResult {
  const yesFlags = countRiskFlags(answers);
  const risk = computeAssessmentRisk(yesFlags);
  const pathfinder = isPathfinderSelfManaged(pathfinderAccess);
  const programGate = resolveProgramGate(risk, pathfinderAccess);
  const today = new Date().toISOString().split('T')[0];

  let notes: string;
  let recommendations: string[];

  if (pathfinder && risk === 'high') {
    notes =
      'Multiple flags detected. You selected limited doctor access — start with gentle, low-impact movement only. Seek care when you can reach a clinic or health post.';
    recommendations = [
      'Begin with Daily Mobility Circuit (Free).',
      'Use low-impact options and stop if symptoms worsen.',
      'When care is available, share your Village Health Card.',
    ];
  } else if (pathfinder && risk === 'moderate') {
    notes =
      'Some caution advised. Pathfinder track: prioritize corrective and bodyweight work until you can consult a clinician.';
    recommendations = [
      'Prioritize the Corrective Exercise Specialist templates.',
      'Build with Bodyweight & Dumbbell Starter first.',
      'Daily Mobility + Mind Habit for recovery.',
    ];
  } else if (pathfinder && risk === 'low') {
    notes =
      'Solid baseline on the Pathfinder track. You can start standard free programs — no doctor visit required to begin moving.';
    recommendations = [
      'Start with Beginner Full Body or Bodyweight program.',
      'Focus on consistent form and daily wins.',
    ];
  } else if (risk === 'high') {
    notes = 'Multiple flags detected. Strongly recommend medical clearance before intense training.';
    recommendations = [
      'Begin with Corrective & Mobility block.',
      'Consult physician when possible.',
      'Use low-impact options and monitor symptoms.',
    ];
  } else if (risk === 'moderate') {
    notes = 'Some caution advised. Consider starting with corrective work.';
    recommendations = [
      'Prioritize the Corrective Exercise Specialist templates.',
      'Build with Bodyweight & Dumbbell Starter first.',
    ];
  } else {
    notes = 'Great baseline. Proceed with standard programs.';
    recommendations = [
      'Start with Beginner Full Body or Bodyweight program.',
      'Focus on consistent form.',
    ];
  }

  return {
    risk,
    notes,
    date: today,
    pathfinderAccess,
    programGate,
    pathfinderTrack: pathfinder,
    recommendations,
  };
}

export function persistAssessment(record: AssessmentRecord): void {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(record);
  localStorage.setItem(STORAGE_ASSESSMENT, json);
  localStorage.setItem(STORAGE_PROGRAM_GATE, record.programGate ?? 'standard');
  localStorage.setItem(STORAGE_PATHFINDER, record.pathfinderTrack ? '1' : '0');
  backupAssessmentJson(json).catch(() => {});
}

export function loadProgramGate(): ProgramGate {
  if (typeof window === 'undefined') return 'standard';
  const raw = localStorage.getItem(STORAGE_PROGRAM_GATE);
  return raw === 'low-impact-only' ? 'low-impact-only' : 'standard';
}

export function isLowImpactGated(): boolean {
  return loadProgramGate() === 'low-impact-only';
}

export function recommendationAllowed(rec: string, gate: ProgramGate): boolean {
  if (gate === 'standard') return true;
  const lower = rec.toLowerCase();
  const lowImpact =
    lower.includes('mobility') ||
    lower.includes('corrective') ||
    lower.includes('mind habit') ||
    lower.includes('low-impact') ||
    lower.includes('village');
  return lowImpact;
}
