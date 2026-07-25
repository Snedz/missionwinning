'use client';

/**
 * Shared UI for the public /calculators/* pages (Modernist, rebrand 2026-07-25).
 *
 * The segmented control is the handoff's native-radio pattern: real inputs,
 * keyboard/AT semantics for free, checked state = ink fill. English chrome by
 * design — these are static SEO surfaces (see PublicPageShell).
 */

export function Seg<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="max-w-md">
      <legend className="mb-2 text-[13px] uppercase tracking-[0.05em] text-muted-foreground">
        {legend}
      </legend>
      <div className="flex w-full flex-wrap border-2 border-foreground">
        {options.map((opt) => (
          <label key={opt.value} className="min-w-0 flex-1 cursor-pointer">
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="flex min-h-[44px] items-center justify-center px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[-4px] peer-focus-visible:outline-[hsl(var(--ring))]">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CalcField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="max-w-md">
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] uppercase tracking-[0.05em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="min-h-[48px] w-full border border-input bg-card px-4 tabular-nums"
      />
    </div>
  );
}

export const KG_PER_LB = 0.453592;

export type CalcUnits = 'kg' | 'lb';

/** kg → display units, rounded honestly (lb whole, kg nearest 0.5). */
export function displayWeight(kg: number, units: CalcUnits): number {
  const v = units === 'lb' ? kg / KG_PER_LB : kg;
  return units === 'lb' ? Math.round(v) : Math.round(v * 2) / 2;
}

export function toKg(value: number, units: CalcUnits): number {
  return units === 'lb' ? value * KG_PER_LB : value;
}
