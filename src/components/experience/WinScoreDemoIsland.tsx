'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ScoreNumeral } from '@/components/ui/ScoreNumeral';
import { animateCount } from '@/lib/motion';
import { gpuTierLabel, resolveGpuTier, type GpuTier } from '@/lib/gpuTier';
import { ExperienceCanvas } from '@/components/experience/gpu/ExperienceCanvas';
import { XP } from '@/components/experience/experienceStrings';

const SETS = [XP.ch04Set1, XP.ch04Set2, XP.ch04Set3] as const;
/** Founder-specified path: 68 → 74 → 80 → 87 (+6 per set). */
const SCORES = [68, 74, 80, 87] as const;

export function WinScoreDemoIsland() {
  const [sets, setSets] = useState(0);
  const [score, setScore] = useState(68);
  const [pr, setPr] = useState(false);
  const [tier, setTier] = useState<GpuTier>('static');
  const [gpuReady, setGpuReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const boot = () => {
      void resolveGpuTier().then((t) => {
        if (!cancelled) {
          setTier(t);
          setGpuReady(true);
        }
      });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(boot, { timeout: 2000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const t = setTimeout(boot, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const logSet = useCallback(() => {
    if (sets >= 3) return;
    const next = sets + 1;
    setSets(next);
    const target = SCORES[next];
    animateCount(score, target, 400, setScore);
    if (next === 3) setPr(true);
  }, [sets, score]);

  const useParticles = gpuReady && tier !== 'static';

  return (
    <div className="xp-score-layout">
      <div>
        <p className="eyebrow">{XP.ch04ScoreLabel}</p>
        <p className="xp-score-num score-tick display-mega" aria-live="polite">
          {score}
        </p>
        <div className="xp-set-row">
          {SETS.map((label, i) => (
            <button
              key={label}
              type="button"
              className="xp-set-btn"
              data-done={sets > i ? 'true' : 'false'}
              disabled={sets !== i}
              onClick={logSet}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className={`xp-pr${pr ? ' eyebrow-honor' : ''}`}
          data-show={pr ? 'true' : 'false'}
          role="status"
        >
          {XP.ch04Pr}
        </div>
        {pr ? (
          <p className="mt-4">
            <Link href="/welcome" className="text-sm text-primary underline-offset-4 hover:underline">
              {XP.ch04Loop}
            </Link>
          </p>
        ) : null}
      </div>
      <div className="xp-score-viz">
        {useParticles ? (
          <ExperienceCanvas
            tier={tier}
            mode="particles"
            className="xp-particle-canvas"
            score={score}
            sets={sets}
            pr={pr}
          />
        ) : null}
        <div className="xp-score-ring" data-hidden-gpu={useParticles ? 'true' : 'false'}>
          {/* The pr/non-pr distinction was brass vs emerald. Brass is retired,
              so a PR is marked by the honor tag beside this numeral instead. */}
          <ScoreNumeral label={XP.ch04ScoreLabel} value={score} size="lg" />
        </div>
        {gpuReady ? (
          <p className="xp-tier-badge xp-score-tier">
            {gpuTierLabel(tier)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
