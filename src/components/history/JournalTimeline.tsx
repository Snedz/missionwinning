'use client';

/**
 * The journal surface — every session entry, chronological, searchable.
 *
 * Each entry is the Granola fusion `composeSessionEntry` saved at finish: the
 * athlete's fragments first, verbatim and attributed; the machine's debrief lines
 * after; the check-in strip as the footer. Fragments are editable here (Granola's
 * post-hoc edit) — the machine's lines are not, because an edited debrief would
 * claim the rules said something they did not.
 *
 * Reads two device-only stores: the session journal (`mw_session_journal`) and
 * mind check-in notes (`mw_mind_checkins`), interleaved by date. Nothing here
 * touches the network — the whole surface works signed-out, offline, forever.
 */

import { useMemo, useState } from 'react';
import { BookOpen, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  listJournalEntries,
  updateJournalFragments,
  type SessionJournalEntry,
} from '@/lib/journal/journalStore';
import { loadCheckIns } from '@/lib/mindCheckIns';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';

type TimelineRow =
  | { type: 'session'; date: string; entry: SessionJournalEntry }
  | { type: 'checkin'; date: string; note: string };

function buildRows(): TimelineRow[] {
  const rows: TimelineRow[] = listJournalEntries().map((entry) => ({
    type: 'session' as const,
    date: entry.date,
    entry,
  }));
  for (const c of loadCheckIns()) {
    if (c.note?.trim()) rows.push({ type: 'checkin', date: c.date, note: c.note.trim() });
  }
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function rowText(row: TimelineRow): string {
  if (row.type === 'checkin') return row.note;
  const { entry } = row;
  return [entry.workoutName, ...(entry.fragments ?? []), ...entry.lines.map((l) => l.text)]
    .join('\n')
    .toLowerCase();
}

const CHECKIN_LABEL: Record<string, string> = {
  sleep: 'Sleep',
  mood: 'Mood',
  stress: 'Stress',
  energy: 'Energy',
  soreness: 'Soreness',
};

export function JournalTimeline() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  // Read once on mount, re-read after an edit. Only ever mounts client-side —
  // the Journal tab is behind a click, so there is no SSR snapshot to mismatch.
  const [rows, setRows] = useState<TimelineRow[]>(() => buildRows());
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => rowText(row).toLowerCase().includes(q));
  }, [rows, query]);

  const startEdit = (entry: SessionJournalEntry) => {
    setEditingId(entry.workoutId);
    setDraft((entry.fragments ?? []).join('\n'));
  };

  const saveEdit = (workoutId: string) => {
    updateJournalFragments(workoutId, draft.split('\n'));
    setEditingId(null);
    setRows(buildRows());
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t('journalEmptyTitle', { defaultValue: 'No journal entries yet' })}
        description={t('journalEmptyDesc', {
          defaultValue: 'Finish a session — debriefs and field notes land here.',
        })}
        actionLabel={t('historyStartWorkout', { defaultValue: 'Open Today' })}
        href="/log"
      />
    );
  }

  return (
    <div className="space-y-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('journalSearchPlaceholder', {
          defaultValue: 'Search your journal…',
        })}
      />
      <p className="text-[11px] text-muted-foreground">
        {t('journalPrivacyLine', {
          defaultValue: 'Your journal stays on this device. It is never uploaded.',
        })}
      </p>
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t('journalNoMatches', { defaultValue: 'Nothing in the journal matches that.' })}
        </p>
      ) : (
        filtered.map((row) =>
          row.type === 'checkin' ? (
            <div key={`c-${row.date}`} className="border-2 border-border bg-card px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {fmt.longDate(row.date)} ·{' '}
                {t('journalCheckInTag', { defaultValue: 'Check-in note' })}
              </p>
              <p className="mt-1 text-sm italic text-foreground">{row.note}</p>
            </div>
          ) : (
            <div key={row.entry.workoutId} className="border-2 border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{row.entry.workoutName}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt.longDate(row.entry.date)}
                    {typeof row.entry.feel === 'number' ? ` · Feel ${row.entry.feel}/5` : ''}
                  </p>
                </div>
                {editingId !== row.entry.workoutId ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => startEdit(row.entry)}
                    aria-label={t('journalEditAria', {
                      name: row.entry.workoutName,
                      defaultValue: `Edit your notes on ${row.entry.workoutName}`,
                    })}
                  >
                    <PenLine className="mr-1 h-3.5 w-3.5" aria-hidden />
                    {t('journalEdit', { defaultValue: 'Edit' })}
                  </Button>
                ) : null}
              </div>

              {editingId === row.entry.workoutId ? (
                <div className="mt-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={Math.max(2, draft.split('\n').length)}
                    aria-label={t('journalEditLabel', { defaultValue: 'Your notes, one per line' })}
                    className="w-full border-2 border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:border-foreground"
                    placeholder={t('journalEditPlaceholder', {
                      defaultValue: 'One note per line — your words, kept verbatim.',
                    })}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(row.entry.workoutId)}>
                      {t('journalSave', { defaultValue: 'Save' })}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      {t('journalCancel', { defaultValue: 'Cancel' })}
                    </Button>
                  </div>
                </div>
              ) : row.entry.fragments && row.entry.fragments.length > 0 ? (
                <ul className="mt-2 space-y-1 border-l-2 border-poster pl-3">
                  {row.entry.fragments.map((fragment, i) => (
                    <li key={i} className="text-sm italic text-foreground">
                      {fragment}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-2 space-y-1">
                {row.entry.lines
                  .filter((l) => l.kind !== 'question')
                  .map((l, i) => (
                    <p
                      key={`${l.kind}-${i}`}
                      className={
                        l.kind === 'record'
                          ? 'text-sm font-semibold text-poster'
                          : 'text-sm text-muted-foreground'
                      }
                    >
                      {l.text}
                    </p>
                  ))}
              </div>

              {/* Ratings are out of five; behaviors are counts, times and
                  yes/no answers. Rendering the second set with a `/5` suffix
                  would misreport what the athlete actually entered. */}
              {row.entry.checkIn ? (
                <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                  {Object.entries(row.entry.checkIn)
                    .filter(([k]) => k !== 'behaviors')
                    .map(([k, v]) => `${CHECKIN_LABEL[k] ?? k} ${v}/5`)
                    .join(' · ')}
                </p>
              ) : null}
              {row.entry.checkIn?.behaviors?.length ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.entry.checkIn.behaviors.join(' · ')}
                </p>
              ) : null}
            </div>
          )
        )
      )}
    </div>
  );
}
