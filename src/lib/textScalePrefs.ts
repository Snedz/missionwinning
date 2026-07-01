export const TEXT_SCALE_OPTIONS = ['sm', 'default', 'lg', 'xl'] as const;
export type TextScale = (typeof TEXT_SCALE_OPTIONS)[number];

const STORAGE_KEY = 'mw_text_scale';

export function readTextScale(): TextScale {
  if (typeof window === 'undefined') return 'default';
  const raw = localStorage.getItem(STORAGE_KEY);
  return TEXT_SCALE_OPTIONS.includes(raw as TextScale) ? (raw as TextScale) : 'default';
}

export function saveTextScale(scale: TextScale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, scale);
  applyTextScaleClass(scale);
}

export function textScaleClass(scale: TextScale): string {
  return scale === 'default' ? 'text-scale-default' : `text-scale-${scale}`;
}

export function applyTextScaleClass(scale: TextScale = readTextScale()): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const opt of TEXT_SCALE_OPTIONS) {
    root.classList.remove(textScaleClass(opt));
  }
  root.classList.add(textScaleClass(scale));
}

export function textScaleLabel(scale: TextScale): string {
  switch (scale) {
    case 'sm':
      return 'Small';
    case 'lg':
      return 'Large';
    case 'xl':
      return 'Extra large';
    default:
      return 'Default';
  }
}
