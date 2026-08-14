'use client';

import type { FeedbackNote } from '@/lib/feedbackSource';
import {
  canAssignDest,
  classifyFeedbackNote,
  formatFeedbackTicket,
  type FeedbackDest,
} from '@/lib/feedbackTriage';
import { parseFeedbackContext } from '@/lib/feedbackNote';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { useMemo, useState } from 'react';

type Props = {
  note: FeedbackNote;
  persistAvailable: boolean;
  onRated: (leadId: number, review: NonNullable<FeedbackNote['review']>) => void;
};

const DEST_LABEL: Record<FeedbackDest, string> = {
  craft: 'Craft',
  voice: 'Voice',
  park: 'Park',
  done: 'Done',
};

export function FeedbackNoteRow({ note, persistAvailable, onRated }: Props) {
  const [busy, setBusy] = useState<FeedbackDest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ctx = useMemo(() => parseFeedbackContext(note.text), [note.text]);
  const triage = useMemo(
    () => classifyFeedbackNote({ text: note.text, screen: note.screen ?? ctx.screen }),
    [note.text, note.screen, ctx.screen]
  );

  const dest = (note.review?.dest as FeedbackDest | undefined) ?? null;
  const leadId = typeof note.id === 'number' ? note.id : null;

  const rate = async (next: FeedbackDest) => {
    if (leadId === null || !persistAvailable) return;
    if (!canAssignDest(triage, next, { founderOverride: true })) return;
    setBusy(next);
    setError(null);
    try {
      const res = await fetch('/api/beta/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, dest: next, class: triage.class }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        review?: NonNullable<FeedbackNote['review']>;
        error?: string;
      };
      if (!res.ok || !body.review) {
        throw new Error(body.error || `Could not rate (${res.status})`);
      }
      onRated(leadId, body.review);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Rate failed');
    } finally {
      setBusy(null);
    }
  };

  const copyTicket = async () => {
    const ticket = formatFeedbackTicket({
      class: (note.review?.class as typeof triage.class) ?? triage.class,
      dest: dest ?? (triage.destEligible.includes('craft') ? 'craft' : 'park'),
      text: note.text,
      screen: note.screen ?? ctx.screen,
      previousScreen: note.previousScreen ?? ctx.previousScreen,
      buildLabel: note.buildLabel ?? ctx.buildLabel,
      aligned: triage.aligned,
    });
    try {
      await navigator.clipboard.writeText(ticket);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <li className="border-t border-border pt-2 first:border-0 first:pt-0 space-y-2">
      <div className="flex justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">{note.name || 'Anonymous'}</span>
        <span className="tabular-nums shrink-0">{localDateKeyFromIso(note.at)}</span>
      </div>
      {note.email ? (
        <div className="text-[11px] text-muted-foreground truncate">{note.email}</div>
      ) : null}
      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{note.text}</p>
      <p className="text-[11px] text-muted-foreground">
        Suggested {triage.class}
        {dest ? ` · rated ${dest}` : ' · unrated'}
        {triage.reasons[0] ? ` — ${triage.reasons[0]}` : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {(['craft', 'voice', 'park', 'done'] as const).map((action) => {
          const allowed = canAssignDest(triage, action, { founderOverride: true });
          const disabled = !allowed || !persistAvailable || leadId === null || busy !== null;
          return (
            <button
              key={action}
              type="button"
              disabled={disabled}
              onClick={() => void rate(action)}
              className="min-h-[44px] border-2 border-border px-2 text-[11px] hover:bg-muted disabled:opacity-50"
            >
              {busy === action ? '…' : DEST_LABEL[action]}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => void copyTicket()}
          className="min-h-[44px] border-2 border-border px-2 text-[11px] hover:bg-muted"
        >
          {copied ? 'Copied' : 'Copy ticket'}
        </button>
      </div>
      {!persistAvailable ? (
        <p className="text-[11px] text-muted-foreground">
          Reviews table not applied — class is suggested only.
        </p>
      ) : null}
      {error ? <p className="text-status-warn text-[11px]">{error}</p> : null}
    </li>
  );
}
