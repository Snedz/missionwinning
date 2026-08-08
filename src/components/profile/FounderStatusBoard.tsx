'use client';

/**
 * Public-safe founder pulse on Account — no secrets, no mission-ops payloads.
 * Full continuity lives in private Mission Control: `npm run ops:dashboard`.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';

export function FounderStatusBoard() {
  return (
    <Card className="content-card border-border">
      <CardHeader>
        <CardTitle className="text-base tracking-tight">Mission status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Build</span>
          <span className="font-mono tabular-nums text-foreground">{APP_BUILD_LABEL}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Free logger</span>
          <span className="text-foreground">Never gated</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
          Project diary, strategy memos, and agent handoff live in private Mission Control on your
          machine — not in this app (keeps war-room content off production).
        </p>
        <pre className="text-[11px] font-mono bg-muted text-foreground p-3 overflow-x-auto border border-border">
          {`npm run ops:dashboard\n# → http://localhost:5173`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Beta funnel metrics stay in the panel above when signed in. Ship history: root{' '}
          <code className="text-[11px]">LOG.md</code> · status:{' '}
          <code className="text-[11px]">CONTEXT.md</code>.
        </p>
      </CardContent>
    </Card>
  );
}
