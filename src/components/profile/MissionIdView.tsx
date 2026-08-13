'use client';
/**
 * Mission ID on Athlete Page / Account. Absent when the athlete has none.
 *
 * Not a rank. Not the 00–99 call-sign. Not shown on Train or Today.
 */
import { useTranslation } from 'react-i18next';
import { formatMissionId } from '@/lib/identity/missionId';

export function MissionIdView({ missionId }: { missionId: number | null }) {
  const { t } = useTranslation();
  if (missionId == null || !Number.isInteger(missionId) || missionId < 1) return null;

  return (
    <p className="text-sm leading-relaxed text-muted-foreground" data-testid="mission-id-block">
      <span className="font-semibold text-foreground">
        {t('missionIdLabel', { defaultValue: 'Mission ID' })}
      </span>{' '}
      <span className="tabular-nums text-foreground" data-testid="mission-id">
        {formatMissionId(missionId)}
      </span>
    </p>
  );
}
