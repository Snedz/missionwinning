/** Text-only movement teaching — optional media when assets exist. */
export interface FormGuide {
  readyPosition?: string;
  setup: string[];
  execute: string[];
  commonErrors?: string[];
  breathing?: string;
  /** Military-style cue names only when guide is for readiness test prep. */
  militaryStyle?: boolean;
  /** Public path e.g. `/form-guides/squats.svg`. */
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}
