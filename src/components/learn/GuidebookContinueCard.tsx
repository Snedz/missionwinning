'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getContinueChapter,
  getGuidebookStats,
  loadGuidebookProgress,
} from '@/lib/guidebookProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked } from 'lucide-react';

export function GuidebookContinueCard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ done: 0, totalSections: 0, pct: 0 });
  const [href, setHref] = useState('/learn/guide');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const sync = () => {
      const completed = loadGuidebookProgress();
      setStats(getGuidebookStats(completed));
      const cont = getContinueChapter(completed);
      if (cont) {
        setHref(`/learn/guide/${cont.chapter.id}`);
        setLabel(`${cont.chapter.title} — ${cont.section.title}`);
      }
    };
    sync();
    window.addEventListener('mw-guidebook-progress', sync);
    return () => window.removeEventListener('mw-guidebook-progress', sync);
  }, []);

  if (stats.pct >= 100) return null;

  return (
    <Card className="content-card border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          {t('guidebookContinue', { defaultValue: 'Continue guidebook' })}
        </CardTitle>
        <CardDescription>
          {stats.done}/{stats.totalSections} sections · {label || t('guidebookTitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="fitness" size="sm" asChild>
          <Link href={href}>{t('learnOpenGuidebook', { defaultValue: 'Open Guidebook →' })}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
