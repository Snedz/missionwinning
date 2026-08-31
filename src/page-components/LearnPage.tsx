'use client';
/**
 * Page: /learn — learn pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { localizeLearnPaths } from '@/lib/localizeLearnPaths';
import { QuietLearnIntroCard } from '@/components/learn/QuietLearnIntroCard';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { BookOpen } from 'lucide-react';

export function LearnPage() {
  const { t } = useTranslation();
  const paths = useMemo(
    () => localizeLearnPaths(FREE_LEARN_PATHS, t),
    [t]
  );

  return (
    <PillarPageShell
      className="house-learn"
      icon={BookOpen}
      eyebrow={t('learnEyebrow', { defaultValue: 'Learn' })}
      title={t('learnTitle', { defaultValue: 'Learn & Master' })}
      subtitle={t('quietLearnSubtitle', {
        defaultValue: 'Log a set. Then Coach from those logs.',
      })}
    >
      <QuietLearnIntroCard paths={paths} />
    </PillarPageShell>
  );
}
