'use client';
/**
 * Local Home gym kit — Account day-one Train settings.
 * Free, no account. Lists what the athlete has so the logger can read equipment.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { scheduleJourneyPush } from '@/lib/journeySync';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  HOME_GYM_ITEMS,
  HOME_GYM_KIT_CHANGED,
  kitHas,
  kitToAthleteHomeGymPick,
  loadHomeGymKit,
  persistHomeGymKit,
  previewKitFromEquipment,
  toggleHomeGymItem,
  type HomeGymItem,
  type HomeGymKit,
} from '@/lib/workout/homeGymKit';
import { loadAthletePageConfig, saveAthletePageConfig } from '@/lib/identity/athleteProfile';

const ITEM_DEFAULTS: Record<HomeGymItem, string> = {
  barbell: 'Barbell',
  rack: 'Rack',
  plates: 'Plates',
  dumbbells: 'Dumbbells',
  'pull-up-bar': 'Pull-up bar',
  floor: 'Floor',
};

function visualKit(): HomeGymKit {
  const stored = loadHomeGymKit();
  if (stored) return stored;
  return previewKitFromEquipment(readRaw(STORAGE_KEYS.equipment) || 'bodyweight');
}

function emitIdentityHomeGym(kit: HomeGymKit): void {
  const page = loadAthletePageConfig();
  if (page.table.homeGym) return;
  saveAthletePageConfig({
    ...page,
    table: { ...page.table, homeGym: kitToAthleteHomeGymPick(kit) },
  });
}

export function HomeGymKitCard() {
  const { t } = useTranslation();
  const [kit, setKit] = useState<HomeGymKit>({ items: ['floor'] });

  useEffect(() => {
    const reload = () => setKit(visualKit());
    reload();
    window.addEventListener(HOME_GYM_KIT_CHANGED, reload);
    return () => window.removeEventListener(HOME_GYM_KIT_CHANGED, reload);
  }, []);

  const onToggle = (item: HomeGymItem) => {
    const next = toggleHomeGymItem(kit, item);
    persistHomeGymKit(next);
    scheduleJourneyPush();
    emitIdentityHomeGym(next);
    setKit(next);
  };

  return (
    <Card className="content-card" id="home-gym-kit" data-testid="home-gym-kit">
      <CardHeader>
        <CardTitle>{t('homeGymKitTitle', { defaultValue: 'Home gym kit' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          {t('homeGymKitBody', {
            defaultValue:
              'List what you actually have. Free, stays on this device. Leave this unset if you train at a full gym.',
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          {HOME_GYM_ITEMS.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={kitHas(kit, item) ? 'selected' : 'outline'}
              className="min-h-[44px] tap-target"
              data-testid={`home-gym-kit-${item}`}
              aria-pressed={kitHas(kit, item)}
              onClick={() => onToggle(item)}
            >
              {t(`homeGymKitItem_${item.replace(/-/g, '_')}`, {
                defaultValue: ITEM_DEFAULTS[item],
              })}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
