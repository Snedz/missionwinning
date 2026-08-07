'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isFreeBeta } from '@/lib/freeBeta';

type ProfilePremiumCardProps = {
  premium: boolean;
  billingBusy: boolean;
  onManageBilling: () => void;
};

export function ProfilePremiumCard({ premium, billingBusy, onManageBilling }: ProfilePremiumCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Free-first beta: no premium / Bundle pitch.
  if (isFreeBeta()) return null;

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>{t('premiumStatus', { defaultValue: 'Premium status' })}</CardTitle>
      </CardHeader>
      <CardContent>
        {premium ? (
          <div className="space-y-3">
            <div className="text-primary font-medium">
              {t('premiumUnlocked', {
                defaultValue: 'Premium unlocked (Super Bundle or demo)',
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px] tap-target"
              disabled={billingBusy}
              onClick={onManageBilling}
            >
              {billingBusy
                ? t('billingPortalOpening', { defaultValue: 'Opening…' })
                : t('manageBilling', { defaultValue: 'Manage billing' })}
            </Button>
          </div>
        ) : (
          <div>
            {t('noPremium', {
              defaultValue:
                'Free tier active. Super Bundle adds Coach depth, deeper library, and specialist programs. Logger stays free.',
            })}
            <Button className="mt-2 min-h-[44px] tap-target" onClick={() => router.push('/bundle')}>
              {t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
