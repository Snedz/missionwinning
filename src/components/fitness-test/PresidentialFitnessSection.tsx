'use client';

import Link from 'next/link';
import { Flag, Medal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';
import { PFT_EVENTS, PFT_MINI_EVENT_IDS } from '@/lib/presidentialFitnessTest';
import { getLatestFitnessTestSession } from '@/lib/presidentialFitnessStorage';
import { useEffect, useState } from 'react';
import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';

/** Presidential Fitness Test promo — scoped section on Benchmarks (U.S. track, free core). */
export function PresidentialFitnessSection() {
 const { t } = useTranslation();
 const fmt = useLocaleFormat();
 const [latest, setLatest] = useState<FitnessTestSession | null>(null);

 useEffect(() => {
 setLatest(getLatestFitnessTestSession());
 }, []);

 if (!isAmericaTrackEnabled()) return null;

 return (
 <Card className="border-border bg-card">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-muted-foreground">
 <Flag className="h-5 w-5" />
 {t('pftSectionTitle', { defaultValue: 'Presidential Fitness Test' })}
 </CardTitle>
 <CardDescription className="text-base leading-relaxed">
 {t('pftSectionDesc', {
 defaultValue:
 'Classic youth fitness events — curl-ups, push-ups, sit-and-reach, mile run, and pull-ups. Free for families and schools. Inspired by America\'s tradition of moving with purpose.',
 })}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid gap-2 sm:grid-cols-2">
 {PFT_EVENTS.slice(0, 4).map((ev) => (
 <div
 key={ev.id}
 className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
 >
 <div className="font-medium">{ev.name}</div>
 <p className="text-xs text-muted-foreground">{ev.description}</p>
 </div>
 ))}
 </div>
 {latest && (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Medal className="h-4 w-4 shrink-0" />
 {t('pftLatestResult', {
 defaultValue: 'Last test: {{tier}} · {{date}}',
 tier: latest.overallTier,
 date: fmt.date(latest.completedAt),
 })}
 </div>
 )}
 <div className="flex flex-col sm:flex-row gap-2">
 <Button asChild className="min-h-[44px] bg-[hsl(var(--status-info))] hover:bg-card">
 <Link href="/fitness-test">{t('pftTakeFull', { defaultValue: 'Take the full test' })}</Link>
 </Button>
 <Button asChild variant="outline" className="min-h-[44px] border-border">
 <Link href={`/fitness-test?mode=mini`}>
 {t('pftTakeMini', {
 defaultValue: 'Mini test ({{events}})',
 events: PFT_MINI_EVENT_IDS.length,
 })}
 </Link>
 </Button>
 <Button asChild variant="outline" className="min-h-[44px] border-border">
 <Link href="/leaderboard?board=presidential-fitness">
 {t('pftLeaderboard', { defaultValue: 'PFT leaderboard' })}
 </Link>
 </Button>
 </div>
 <p className="text-[10px] text-muted-foreground text-center pt-1">
 {t('pftDisclaimer', {
 defaultValue:
 'Educational fitness tool by Mission Winning LLC — not an official U.S. government test or endorsement.',
 })}
 </p>
 </CardContent>
 </Card>
 );
}
