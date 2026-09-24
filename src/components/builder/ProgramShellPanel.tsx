'use client';

/**
 * Browse one offline program template and save another on this device.
 * Start hands suggested sets to Train. It does not bill and it does not
 * write history by itself.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getExerciseById } from '@/data/exercises';
import {
  PROGRAM_EQUIPMENT,
  PROGRAM_LEVELS,
  buildLocalProgram,
  listPrograms,
  saveProgram,
  type Program,
  type ProgramEquipment,
  type ProgramLevel,
  type ProgramSession,
} from '@/lib/programShell';

export function ProgramShellPanel({
  onStartSession,
}: {
  onStartSession: (program: Program, session: ProgramSession) => void;
}) {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState(() => listPrograms());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<ProgramLevel>('beginner');
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [equipment, setEquipment] = useState<ProgramEquipment[]>(['barbell', 'bodyweight']);
  const [notice, setNotice] = useState('');

  const selected = programs.find((p) => p.id === selectedId) ?? programs[0];

  const levelLabel = (value: ProgramLevel) => {
    if (value === 'beginner') return t('builderTabBeginner', { defaultValue: 'Beginner' });
    if (value === 'intermediate') return t('programShellIntermediate', { defaultValue: 'Intermediate' });
    return t('builderTabAdvanced', { defaultValue: 'Advanced' });
  };

  const equipmentLabel = (item: ProgramEquipment) => {
    if (item === 'barbell') return t('programShellEqBarbell', { defaultValue: 'Barbell' });
    if (item === 'dumbbell') return t('programShellEqDumbbell', { defaultValue: 'Dumbbell' });
    if (item === 'bodyweight') return t('programShellEqBodyweight', { defaultValue: 'Bodyweight' });
    if (item === 'band') return t('programShellEqBand', { defaultValue: 'Band' });
    if (item === 'bench') return t('programShellEqBench', { defaultValue: 'Bench' });
    return t('programShellEqPullup', { defaultValue: 'Pull-up bar' });
  };

  const toggleEquipment = (item: ProgramEquipment) => {
    setEquipment((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      return [...prev, item];
    });
  };

  const onSave = () => {
    const built = buildLocalProgram(
      { title, level, durationWeeks, sessionsPerWeek, equipment },
      programs.map((p) => p.id)
    );
    if (!title.trim()) {
      setNotice(t('programShellNameRequired', { defaultValue: 'Name the program.' }));
      return;
    }
    if (!built) {
      setNotice(t('programShellSaveFail', { defaultValue: 'Could not save on this device.' }));
      return;
    }
    if (!saveProgram(built)) {
      setNotice(t('programShellSaveFail', { defaultValue: 'Could not save on this device.' }));
      return;
    }
    setPrograms(listPrograms());
    setSelectedId(built.id);
    setCreating(false);
    setTitle('');
    setNotice(t('programShellSaved', { defaultValue: 'Saved on this device.' }));
  };

  return (
    <section className="program-shell" data-testid="program-shell">
      <p className="house-kicker">{t('programShellKicker', { defaultValue: 'Offline program' })}</p>
      <p className="house-lede">
        {t('programShellLead', {
          defaultValue: 'Template on this device. Suggested sets are not a logged workout.',
        })}
      </p>
      <div className="house-list" data-testid="program-shell-list">
        {programs.map((program) => (
          <div key={program.id} className="house-item">
            <div className="house-item-body">
              <strong>{program.title}</strong>
              <span>
                {t('programShellMeta', {
                  weeks: program.durationWeeks,
                  perWeek: program.sessionsPerWeek,
                  level: levelLabel(program.level),
                  defaultValue: '{{weeks}} weeks · {{perWeek}} a week · {{level}}',
                })}
              </span>
            </div>
            <button
              type="button"
              className="house-btn"
              data-testid={`program-shell-open-${program.id}`}
              onClick={() => setSelectedId(program.id)}
            >
              {t('builderDetails', { defaultValue: 'Details' })}
            </button>
          </div>
        ))}
      </div>

      {selected ? (
        <div data-testid="program-shell-detail">
          <p className="house-lede">{selected.description}</p>
          <p className="house-lede">
            {t('programShellEquipment', { defaultValue: 'Equipment' })}
            {': '}
            {selected.equipment.map((item) => equipmentLabel(item)).join(', ')}
          </p>
          {selected.weeks.map((week) => (
            <div key={week.weekNumber}>
              <p className="house-kicker">
                {t('programShellWeek', {
                  n: week.weekNumber,
                  defaultValue: 'Week {{n}}',
                })}
              </p>
              {week.sessions.map((session) => (
                <div key={session.id} className="house-item">
                  <div className="house-item-body">
                    <strong>{session.title}</strong>
                    <span>
                      {session.exercises
                        .map(
                          (exercise) =>
                            `${getExerciseById(exercise.exerciseId)?.name ?? exercise.exerciseId} · ${t('programShellSets', {
                              count: exercise.suggestedSets.length,
                              defaultValue: '{{count}} suggested sets',
                            })}`
                        )
                        .join(' · ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="house-btn"
                    data-testid={`program-shell-start-${session.id}`}
                    onClick={() => onStartSession(selected, session)}
                  >
                    {t('programShellStart', { defaultValue: 'Start in Train' })}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="house-btn house-btn-ghost"
        data-testid="program-shell-new"
        onClick={() => setCreating((v) => !v)}
      >
        {t('programShellNew', { defaultValue: 'New program' })}
      </button>

      {creating ? (
        <div data-testid="program-shell-form">
          <label className="house-lede" htmlFor="program-shell-name">
            {t('programShellName', { defaultValue: 'Program name' })}
          </label>
          <input
            id="program-shell-name"
            className="house-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div>
            {PROGRAM_LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                className={`house-state${level === item ? ' is-on' : ''}`}
                onClick={() => setLevel(item)}
              >
                {levelLabel(item)}
              </button>
            ))}
          </div>
          <label className="house-lede" htmlFor="program-shell-weeks">
            {t('programShellWeek', { n: durationWeeks, defaultValue: 'Week {{n}}' })}
          </label>
          <input
            id="program-shell-weeks"
            className="house-field"
            type="number"
            min={1}
            max={4}
            value={durationWeeks}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n)) setDurationWeeks(Math.min(4, Math.max(1, n)));
            }}
          />
          <label className="house-lede" htmlFor="program-shell-per-week">
            {t('programShellPerWeek', {
              count: sessionsPerWeek,
              defaultValue: '{{count}} a week',
            })}
          </label>
          <input
            id="program-shell-per-week"
            className="house-field"
            type="number"
            min={1}
            max={3}
            value={sessionsPerWeek}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n)) setSessionsPerWeek(Math.min(3, Math.max(1, n)));
            }}
          />
          <div>
            {PROGRAM_EQUIPMENT.map((item) => (
              <button
                key={item}
                type="button"
                className={`house-state${equipment.includes(item) ? ' is-on' : ''}`}
                onClick={() => toggleEquipment(item)}
              >
                {equipmentLabel(item)}
              </button>
            ))}
          </div>
          <button type="button" className="house-btn" data-testid="program-shell-save" onClick={onSave}>
            {t('programShellSave', { defaultValue: 'Save on this device' })}
          </button>
        </div>
      ) : null}
      {notice ? <p className="house-lede">{notice}</p> : null}
    </section>
  );
}
