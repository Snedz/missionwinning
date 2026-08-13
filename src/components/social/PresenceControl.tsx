'use client';

import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PRESENCE_STATUSES, type PresenceStatus } from '@/lib/social/types';

const LABEL_KEYS: Record<PresenceStatus, string> = {
  available: 'serverPresenceAvailable',
  away: 'serverPresenceAway',
  offline: 'serverPresenceOffline',
};

const DEFAULTS: Record<PresenceStatus, string> = {
  available: 'Available',
  away: 'Away',
  offline: 'Offline',
};

export function PresenceControl({
  value,
  onChange,
}: {
  value: PresenceStatus;
  onChange: (next: PresenceStatus) => void;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      ariaLabel={t('serverPresenceLabel', { defaultValue: 'Presence' })}
      fill
      value={value}
      onChange={onChange}
      options={PRESENCE_STATUSES.map((status) => ({
        value: status,
        label: t(LABEL_KEYS[status], { defaultValue: DEFAULTS[status] }),
      }))}
    />
  );
}
