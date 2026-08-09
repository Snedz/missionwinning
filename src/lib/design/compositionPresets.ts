/**
 * Hero composition presets — Field manual / Strong table / Quiet linear.
 *
 * Shipped product applies **Field manual (A)** after the 2026-08-09 hero-feel
 * explore pass. B and C are preserved as product-direction inventory for a
 * future **user-selectable composition mode** (layout density inside the
 * locked Modernist system — not alternate color themes or typefaces).
 *
 * Personal AI angle (founder thesis, not this ship): owning how the product
 * *presents* intelligence (briefing vs table vs quiet) is a controllable
 * surface, distinct from latent-model black boxes. Do not implement a
 * settings picker until the default A path has lived in production and the
 * free logger / red-action guards stay green under each mode.
 *
 * Artifacts: ~/.gstack/projects/.../designs/hero-feel-{date}/boards/
 *
 * Not a theme engine. Tokens stay paper/ink/Archivo/radius 0.
 */

export type CompositionPresetId = 'field-manual' | 'strong-table' | 'quiet-linear';

export type CompositionPreset = {
  id: CompositionPresetId;
  letter: 'A' | 'B' | 'C';
  label: string;
  emotion: {
    today: 'composure';
    active: 'focus';
    victory: 'honor';
    coach: 'clarity';
  };
  /** One-line product promise for marketing / settings copy later. */
  promise: string;
  /** Shipped as the live default composition. */
  shippedDefault: boolean;
};

export const COMPOSITION_PRESETS: readonly CompositionPreset[] = [
  {
    id: 'field-manual',
    letter: 'A',
    label: 'Field manual',
    emotion: {
      today: 'composure',
      active: 'focus',
      victory: 'honor',
      coach: 'clarity',
    },
    promise: 'Briefing hierarchy: eyebrow → display → one red action. Chrome recedes.',
    shippedDefault: true,
  },
  {
    id: 'strong-table',
    letter: 'B',
    label: 'Strong table',
    emotion: {
      today: 'composure',
      active: 'focus',
      victory: 'honor',
      coach: 'clarity',
    },
    promise: 'Session and set-table density first. Logger-class under load.',
    shippedDefault: false,
  },
  {
    id: 'quiet-linear',
    letter: 'C',
    label: 'Quiet linear',
    emotion: {
      today: 'composure',
      active: 'focus',
      victory: 'honor',
      coach: 'clarity',
    },
    promise: 'Air, large type, single focus column. Least simultaneous chrome.',
    shippedDefault: false,
  },
] as const;

export function defaultCompositionPreset(): CompositionPreset {
  const hit = COMPOSITION_PRESETS.find((p) => p.shippedDefault);
  return hit ?? COMPOSITION_PRESETS[0]!;
}

export function compositionPresetById(id: CompositionPresetId): CompositionPreset | undefined {
  return COMPOSITION_PRESETS.find((p) => p.id === id);
}
