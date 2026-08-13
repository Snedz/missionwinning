/**
 * Why-this transparency report — inspectability without a ranker.
 *
 * We are not X and we do not have a For You feed. Each row is a product
 * fact with a plain reason: logger, launch gate, region policy, coach
 * (log-cited), earn table, Super Bundle wait-until-Stripe.
 */

export type TransparencyStatus = 'open' | 'gated' | 'hidden' | 'limited' | 'info';

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
  /** Always non-empty. Gated / hidden / limited must name the policy. */
  reason: string;
  details?: string[];
};

export type EarnTableRow = {
  actionId: string;
  event: string;
  points: number;
  cap: string;
};

export type TransparencyReport = {
  app: 'mission-winning';
  kind: 'transparency-report';
  generatedAt: string;
  buildLabel: string;
  rows: TransparencyRow[];
  earnTable: EarnTableRow[];
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
