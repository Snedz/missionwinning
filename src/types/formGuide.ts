/** Text-only movement teaching — optional media when assets exist. */
export interface FormGuide {
  readyPosition?: string;
  setup: string[];
  execute: string[];
  commonErrors?: string[];
  breathing?: string;
  /** Military-style cue names only when guide is for readiness test prep. */
  militaryStyle?: boolean;
  /**
   * Primary media URL — prefer `/form/{id}/side.webp|webm` (Form Index pack).
   * Legacy: `/form-guides/{id}.svg` or pattern SVG.
   */
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  /** Poster for video packs (side.webp while mediaUrl is side.webm). */
  mediaPosterUrl?: string;
  /**
   * Optional caption under the diagram. Pattern-pack media should state that
   * the art is shared — not exercise-specific — so we stay honest mid-set.
   */
  mediaCaption?: string;
}
