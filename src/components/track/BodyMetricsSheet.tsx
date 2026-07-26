'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UnitsPref } from '@/lib/units';
import { kgToDisplay, displayToKg, weightUnitLabel } from '@/lib/units';
import type { BodyMetricEntry } from '@/lib/bodyMetrics';

type Props = {
  open: boolean;
  onClose: () => void;
  initial: BodyMetricEntry | null;
  onSave: (entry: BodyMetricEntry) => void;
  units: UnitsPref;
};

export function BodyMetricsSheet({ open, onClose, initial, onSave, units }: Props) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');
  const [hip, setHip] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setDate(today);
    if (initial?.weightKg != null) {
      setWeight(String(Math.round(kgToDisplay(initial.weightKg, units) * 10) / 10));
    } else setWeight('');
    setBodyFat(initial?.bodyFatPct != null ? String(initial.bodyFatPct) : '');
    setWaist(initial?.waistCm != null ? String(initial.waistCm) : '');
    setChest(initial?.chestCm != null ? String(initial.chestCm) : '');
    setArm(initial?.armCm != null ? String(initial.armCm) : '');
    setHip(initial?.hipCm != null ? String(initial.hipCm) : '');
    setNote(initial?.note ?? '');
  }, [open, initial, units, today]);

  if (!open) return null;

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && s.trim() !== '' ? n : undefined;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = num(weight);
    onSave({
      date,
      weightKg: w != null ? displayToKg(w, units) : undefined,
      bodyFatPct: num(bodyFat),
      waistCm: num(waist),
      chestCm: num(chest),
      armCm: num(arm),
      hipCm: num(hip),
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-card p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md border-2 border-border bg-card p-5 space-y-3"
      >
        <h2 className="text-lg font-semibold">
          {t('bodyMetricsLogTitle', { defaultValue: 'Log body metrics' })}
        </h2>
        <div>
          <Label htmlFor="bm-date">{t('bodyDate', { defaultValue: 'Date' })}</Label>
          <Input id="bm-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field
            id="bm-w"
            label={`${t('bodyWeight', { defaultValue: 'Weight' })} (${weightUnitLabel(units)})`}
            value={weight}
            onChange={setWeight}
            step="0.1"
          />
          <Field
            id="bm-bf"
            label={t('bodyFat', { defaultValue: 'Body fat %' })}
            value={bodyFat}
            onChange={setBodyFat}
            step="0.1"
          />
          <Field id="bm-waist" label="Waist cm" value={waist} onChange={setWaist} step="0.1" />
          <Field id="bm-chest" label="Chest cm" value={chest} onChange={setChest} step="0.1" />
          <Field id="bm-arm" label="Arm cm" value={arm} onChange={setArm} step="0.1" />
          <Field id="bm-hip" label="Hip cm" value={hip} onChange={setHip} step="0.1" />
        </div>
        <div>
          <Label htmlFor="bm-note">{t('bodyNote', { defaultValue: 'Note' })}</Label>
          <Input id="bm-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1">
            {t('bodySave', { defaultValue: 'Save' })}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step ?? '1'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tabular-nums"
      />
    </div>
  );
}
