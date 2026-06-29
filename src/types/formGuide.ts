/** Text-only movement teaching — no licensed video required. */
export interface FormGuide {
  readyPosition?: string;
  setup: string[];
  execute: string[];
  commonErrors?: string[];
  breathing?: string;
  /** Military-style cue names only when guide is for readiness test prep. */
  militaryStyle?: boolean;
}
