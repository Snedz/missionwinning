'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  PARQ_INTAKE_KEYS,
  persistParqScreen,
  scoreParqAnswers,
} from '@/lib/journey/parqIntake';

type Props = {
  onDone: () => void;
};

/**
 * ISSA-style door: seven flags before the first coach generate.
 * Not a pillar page. Not on Today. Logger stays ungated.
 */
export function ParqIntakeCard({ onDone }: Props) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const ready = PARQ_INTAKE_KEYS.every((k) => answers[k]);

  const submit = () => {
    const { risk } = scoreParqAnswers(answers);
    const notes =
      risk === 'high'
        ? t('assessRiskHighNotes', {
            defaultValue:
              'Multiple flags. Talk to a qualified professional before loading intensity.',
          })
        : risk === 'moderate'
          ? t('assessRiskModerateNotes', {
              defaultValue: 'Some flags. Train, but get medical advice if anything worsens.',
            })
          : t('assessRiskLowNotes', {
              defaultValue: 'Educational screen only — not medical advice.',
            });
    persistParqScreen({ risk, notes });
    onDone();
  };

  return (
    <div className="space-y-4 border-2 border-border bg-card p-4" data-testid="parq-intake">
      <p className="text-sm font-semibold">
        {t('firstStepParqTitle', { defaultValue: 'Screen before a coach plan' })}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('firstStepParqWhy', {
          defaultValue:
            'A short safety questionnaire before Mission Coach generates a week. Log set never waits on it.',
        })}
      </p>
      {PARQ_INTAKE_KEYS.map((key) => (
        <div key={key} className="space-y-1">
          <div className="text-sm font-semibold">
            {t(`assessQ_${key}`, { defaultValue: key })}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['yes', 'no', 'unsure'] as const).map((opt) => (
              <Button
                key={opt}
                size="sm"
                variant={answers[key] === opt ? 'selected' : 'outline'}
                className="min-h-[44px] tap-target"
                onClick={() => setAnswers((prev) => ({ ...prev, [key]: opt }))}
              >
                {opt === 'yes'
                  ? t('assessYes', { defaultValue: 'Yes' })
                  : opt === 'no'
                    ? t('assessNo', { defaultValue: 'No' })
                    : t('assessUnsure', { defaultValue: 'Unsure' })}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <Button
        className="w-full min-h-[44px] tap-target primary-action"
        onClick={submit}
        disabled={!ready}
      >
        {t('submitAssessment', { defaultValue: 'Continue to this week' })}
      </Button>
      <p className="text-xs text-muted-foreground">
        {t('assessDisclaimer', {
          defaultValue: 'Educational screening only — not medical advice.',
        })}
      </p>
    </div>
  );
}
