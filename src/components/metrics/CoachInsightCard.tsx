'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CoachInsight } from '@/lib/score';

interface CoachInsightCardProps {
  insight: CoachInsight;
}

export function CoachInsightCard({ insight }: CoachInsightCardProps) {
  const router = useRouter();

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Coach insight
        </CardTitle>
        <CardDescription>Based on your readiness, strain, and recovery</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-foreground/90 flex-1">{insight.message}</p>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => router.push(insight.actionPath)}>
          {insight.actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
