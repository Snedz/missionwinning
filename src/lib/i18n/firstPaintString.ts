import i18n from '@/i18n';

/** Replace `{{name}}` placeholders when i18n is not ready yet. */
export function interpolateTemplate(
  template: string,
  params?: Record<string, unknown>
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] != null ? String(params[name]) : ''
  );
}

/**
 * Never paint raw i18n keys or unreplaced `{{placeholders}}` on first paint /
 * SSR. Uses the English floor until i18n is initialized, then `t` with the
 * same floor. Falls back when the resolved string still looks broken.
 */
export function firstPaintString(
  key: string,
  floor: string,
  t: (k: string, opts?: Record<string, unknown>) => string,
  params?: Record<string, unknown>
): string {
  const merged = { ...params, defaultValue: floor };
  if (typeof window === 'undefined' || !i18n.isInitialized) {
    return interpolateTemplate(floor, params);
  }
  const out = t(key, merged);
  if (!out || out === key || out.includes('{{')) {
    return interpolateTemplate(floor, params);
  }
  return out;
}
