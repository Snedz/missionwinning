'use client';

import { useState, type ComponentType } from 'react';
import { LANDING_PREVIEW_EN as copy } from '@/i18n/landingPreviewLocales';
import s from './landingV2.module.css';

export default function LandingV2DemoLoader() {
  const [Demo, setDemo] = useState<ComponentType>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    if (Demo) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const { default: WeekDemo } = await import('./LandingV2Demo');
      setDemo(() => WeekDemo);
      setOpen(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return <div className={s.demo}>
    <button className={s.secondary} type="button" aria-expanded={open} aria-controls="notebook-week-demo" disabled={loading} onClick={toggle}>
      {open ? copy.demoClose : loading ? copy.demoLoading : copy.demoOpen}
    </button>
    <p className={s.note}>{copy.demoNote}</p>
    {error && <p role="alert">{copy.demoError}</p>}
    <div id="notebook-week-demo" hidden={!open}>{Demo && <Demo />}</div>
  </div>;
}
