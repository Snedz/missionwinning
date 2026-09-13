'use client';

/**
 * Public-safe founder pulse on Account — no secrets, no mission-ops payloads.
 * Full continuity lives in private Mission Control: `npm run ops:dashboard`.
 */

import { useTranslation } from 'react-i18next';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';

export function FounderStatusBoard() {
  const { t } = useTranslation();
  return (
    <div className="house-card space-y-3 text-sm" data-testid="account-founder-status-board">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {t('founderStatusTitle', { defaultValue: 'Mission status' })}
      </h3>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">
            {t('founderStatusBuild', { defaultValue: 'Build' })}
          </span>
          <span className="font-mono tabular-nums text-foreground">{APP_BUILD_LABEL}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">
            {t('founderStatusFreeLogger', { defaultValue: 'Free logger' })}
          </span>
          <span className="text-foreground">
            {t('founderStatusFreeLoggerValue', { defaultValue: 'Never gated' })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
          {t('founderStatusOpsHint', {
            defaultValue:
              'Project diary, strategy memos, and agent handoff live in private Mission Control on your machine — not in this app (keeps war-room content off production).',
          })}
        </p>
        <pre className="text-[11px] font-mono bg-muted text-foreground p-3 overflow-x-auto border border-border">
          {t('founderStatusOpsCmd', {
            defaultValue: 'npm run ops:dashboard\n# → http://localhost:5173',
          })}
        </pre>
        <p className="text-xs text-muted-foreground">
          {t('founderStatusFoot', {
            defaultValue:
              'Beta funnel metrics stay in the panel above when signed in. Ship history: root LOG.md · status: CONTEXT.md.',
          })}
        </p>
    </div>
  );
}
