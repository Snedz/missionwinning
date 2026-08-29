'use client';

/**
 * Persistent collapsible N-of-N under Start. First paint — mount even
 * before the desk snap so the Thursday desk stays dense.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ban, Check, ChevronRight, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { writeTodayComposeSession } from '@/lib/workout/writeTodayComposeSession';
import {
  getHouseFirstRooms,
  readHouseChecklistCollapsed,
  readHouseHistoryOpened,
  readHouseWeekOpened,
  summarizeHouseFirstRooms,
  writeHouseChecklistCollapsed,
  type HouseFirstRoom,
} from './houseFirstRooms';
import { useHousePane } from './HousePane';

type Props = {
  loggedSet: boolean;
  hasFinish: boolean;
  onLogSet: () => void;
};

export function HouseFirstRoomsCard({ loggedSet, hasFinish, onLogSet }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { openPane } = useHousePane();
  const [collapsed, setCollapsed] = useState(readHouseChecklistCollapsed);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const rooms = getHouseFirstRooms({
    loggedSet,
    weekOpened: readHouseWeekOpened(),
    historyOpened: readHouseHistoryOpened(),
    hasFinish,
  });
  const progress = summarizeHouseFirstRooms(rooms);
  const expandedKey = openKey ?? rooms.find((row) => !row.done && !row.locked)?.key ?? rooms[0]?.key ?? null;

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeHouseChecklistCollapsed(next);
  };

  const runRow = (row: HouseFirstRoom) => {
    setOpenKey(row.key);
    if (row.locked) return;
    if (row.kind === 'compose') {
      onLogSet();
      return;
    }
    if (row.kind === 'pane') {
      openPane('week');
      document.getElementById('today-week')?.scrollIntoView({ block: 'start' });
      return;
    }
    if (row.href) router.push(row.href);
  };

  return (
    <section className="house-card house-first-rooms" style={{ marginTop: 18 }} data-testid="today-first-steps">
      <div className="house-row">
        <h2 className="house-side-title" style={{ margin: 0 }}>
          {t('houseFirstRoomsTitle', { defaultValue: 'Your first rooms' })}
        </h2>
        <button
          type="button"
          className="house-btn house-btn-ghost"
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? t('houseGuideExpand', { defaultValue: 'Expand' })
              : t('houseGuideCollapse', { defaultValue: 'Collapse' })
          }
          onClick={toggleCollapsed}
        >
          {collapsed ? <Plus className="h-4 w-4" aria-hidden /> : <Minus className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      <p className="house-check-progress">
        {t('firstStepsCount', {
          defaultValue: '{{done}} of {{total}} complete',
          done: progress.done,
          total: progress.total,
        })}
      </p>
      <div className={`house-check-fold${collapsed ? ' is-closed' : ''}`}>
        <div className="house-check-fold-inner">
          <div className="house-check">
            {rooms.map((row) => {
              const open = row.key === expandedKey;
              return (
                <div
                  key={row.key}
                  className={`house-check-row${row.done ? ' is-done' : ''}${open ? ' is-open' : ''}${row.locked ? ' is-locked' : ''}`}
                  data-testid="house-check-row"
                  data-house-step={row.key}
                >
                  {row.kind === 'compose' && row.href ? (
                    <Link
                      href="/active"
                      data-testid="today-first-log-set"
                      aria-expanded={open}
                      onClick={() => {
                        setOpenKey(row.key);
                        writeTodayComposeSession();
                      }}
                    >
                      <span className="house-check-copy">
                        <strong>{t(row.titleKey, { defaultValue: row.title })}</strong>
                        <span className="house-check-why">
                          <span>{t(row.whyKey, { defaultValue: row.why })}</span>
                        </span>
                      </span>
                      <span className="house-check-mark">
                        {row.done ? (
                          <Check className="h-4 w-4" aria-hidden />
                        ) : (
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                    </Link>
                  ) : row.kind === 'navigate' && row.href ? (
                    <Link
                      data-testid="today-first-history"
                      href="/history"
                      aria-expanded={open}
                      onClick={(event) => {
                        setOpenKey(row.key);
                        if (row.locked) event.preventDefault();
                      }}
                    >
                      <span className="house-check-copy">
                        <strong>{t(row.titleKey, { defaultValue: row.title })}</strong>
                        <span className="house-check-why">
                          <span>{t(row.whyKey, { defaultValue: row.why })}</span>
                        </span>
                      </span>
                      <span className="house-check-mark">
                        {row.done ? (
                          <Check className="h-4 w-4" aria-hidden />
                        ) : row.locked ? (
                          <span className="house-lock">
                            <Ban className="h-4 w-4" aria-hidden />
                            <span className="house-lock-tip" role="tooltip">
                              {t(row.lockWhyKey ?? 'houseFirstHistoryLock', {
                                defaultValue: row.lockWhy ?? 'Finish a session first — then History is yours.',
                              })}
                            </span>
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                    </Link>
                  ) : (
                    <button type="button" aria-expanded={open} onClick={() => runRow(row)}>
                      <span className="house-check-copy">
                        <strong>{t(row.titleKey, { defaultValue: row.title })}</strong>
                        <span className="house-check-why">
                          <span>{t(row.whyKey, { defaultValue: row.why })}</span>
                        </span>
                      </span>
                      <span className="house-check-mark">
                        {row.done ? (
                          <Check className="h-4 w-4" aria-hidden />
                        ) : row.locked ? (
                          <span className="house-lock">
                            <Ban className="h-4 w-4" aria-hidden />
                            <span className="house-lock-tip" role="tooltip">
                              {t(row.lockWhyKey ?? 'houseFirstHistoryLock', {
                                defaultValue: row.lockWhy ?? 'Finish a session first — then History is yours.',
                              })}
                            </span>
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
