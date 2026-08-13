/**
 * Visibility + Under the Hood report.
 *
 * Each row is a product fact with a plain reason: logger, launch gate,
 * region policy, coach (log-cited), score privacy, Super Bundle notify-only.
 * Weights are our earn table and visibility filters — never another product's
 * ranking scores treated as XP.
 */

export type TransparencyStatus =
  | 'open'
  | 'gated'
  | 'hidden'
  | 'limited'
  | 'info'
  | 'skipped';

export type TransparencyRowId =
  | 'logger'
  | 'access'
  | 'region'
  | 'coach'
  | 'score'
  | 'bundle';

export type TransparencyRow = {
  id: TransparencyRowId;
  title: string;
  status: TransparencyStatus;
  /** Always non-empty. Gated / hidden / limited / skipped must name the policy. */
  reason: string;
  details?: string[];
};

export type EarnTableRow = {
  actionId: string;
  event: string;
  points: number;
  cap: string;
};

export type WeightKind = 'boost' | 'penalty';

export type WeightRow = {
  id: string;
  label: string;
  kind: WeightKind;
  /** Live or planned points. Null for visibility-only penalties. */
  points: number | null;
  /** Graphic-style cell: "+50" or "does not debit points". */
  display: string;
  cap: string;
  live: boolean;
  source: string;
  note?: string;
};

export type AthleteLabel = {
  id: TransparencyRowId;
  title: string;
  status: TransparencyStatus;
  /** True when this row is a limit or a privacy/skip label on this athlete. */
  applies: boolean;
  reason: string;
};

export type TransparencyReport = {
  app: 'mission-winning';
  kind: 'transparency-report';
  generatedAt: string;
  buildLabel: string;
  rows: TransparencyRow[];
  earnTable: EarnTableRow[];
  boosts: WeightRow[];
  clubPlannedBoosts: WeightRow[];
  penalties: WeightRow[];
  athleteLabels: AthleteLabel[];
  sources: {
    live: string;
    club: string;
    visibility: string;
    dailySoftCap: number;
  };
  limitsApply: number;
};

export type TerritoryInput = {
  blocked: boolean;
  reason: string | null;
  message: string | null;
  country: string | null;
};

export type CoachInput = {
  hasPlan: boolean;
  rationaleCompact: string | null;
  rationaleInput: string | null;
  rationaleRule: string | null;
  rationaleEffect: string | null;
};

export type TransparencyInput = {
  generatedAt?: string;
  buildLabel: string;
  privateGateEnabled: boolean;
  freeBeta: boolean;
  stripeCheckoutEnabled: boolean;
  territory: TerritoryInput;
  coach: CoachInput;
};
