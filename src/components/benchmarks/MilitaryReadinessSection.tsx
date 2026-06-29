'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MILITARY_READINESS_TESTS } from '@/lib/militaryReadinessTests';

/** Optional service fitness test prep — military tone scoped to this section only. */
export function MilitaryReadinessSection() {
  return (
    <Card className="border-amber-800/30 bg-gradient-to-br from-amber-950/20 to-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500/90">
          <Shield className="h-5 w-5" />
          Readiness test prep
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Optional standards for push-ups, pull-ups, deadlift, and loaded carries — for members
          preparing for service fitness tests. The rest of Mission Winning is for{' '}
          <strong>everyone worldwide</strong> building lifelong health (free core forever).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {MILITARY_READINESS_TESTS.map((test) => (
          <div
            key={test.id}
            className="rounded-xl border border-amber-800/20 bg-black/20 px-4 py-3 space-y-1"
          >
            <div className="font-medium">{test.name}</div>
            <p className="text-sm text-muted-foreground">{test.description}</p>
            <p className="text-xs text-amber-600/70">{test.scoringHint}</p>
          </div>
        ))}
        <Button asChild variant="outline" className="w-full min-h-[44px] border-amber-800/30">
          <Link href="/active">Train for standards →</Link>
        </Button>
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Civilian health app — not affiliated with any armed service. Form guides use test-prep language here only.
        </p>
      </CardContent>
    </Card>
  );
}
