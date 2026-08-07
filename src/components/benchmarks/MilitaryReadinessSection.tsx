'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MILITARY_READINESS_TESTS } from '@/lib/militaryReadinessTests';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';

/**
 * Optional service fitness test prep — military tone scoped to this section only.
 *
 * Self-gates on the america surface. It renders on `/benchmarks`, a secondary pillar
 * that is **on by default**, so without this the america track leaked onto a live
 * route while `/america` and `/fitness-test` returned 404 — and america is parked for
 * legal and channel reasons, not tidiness. Its sibling `PresidentialFitnessSection`
 * on the same page has always checked this flag; this one never did.
 *
 * Gated in the component rather than at the call site so a future call site inherits
 * it, the way the sibling already works.
 */
export function MilitaryReadinessSection() {
  if (!isAmericaTrackEnabled()) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
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
          <div key={test.id}
            className="border border-border bg-card px-4 py-3 space-y-1"
          >
            <div className="font-medium">{test.name}</div>
            <p className="text-sm text-muted-foreground">{test.description}</p>
            <p className="text-xs text-muted-foreground">{test.scoringHint}</p>
          </div>
        ))}
        <Button asChild variant="outline" className="w-full min-h-[44px] border-border">
          <Link href="/active">Train for standards</Link>
        </Button>
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Civilian health app — not affiliated with any armed service. Form guides use test-prep language here only.
        </p>
      </CardContent>
    </Card>
  );
}
