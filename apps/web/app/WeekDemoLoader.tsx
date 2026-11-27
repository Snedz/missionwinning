'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import styles from './landing.module.css';

export default function WeekDemoLoader() {
  const [Demo, setDemo] = useState<ComponentType>();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    if (Demo) {
      setOpen(!open);
      setStatus('');
      return;
    }
    setLoading(true);
    setStatus('Loading the demo…');
    try {
      const { default: PlannerDemo } = await import('./WeekDemo');
      setDemo(() => PlannerDemo);
      setOpen(true);
      setStatus('Demo ready. Choose your settings below.');
    } catch {
      setStatus('Could not load the demo. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return <div className={styles.demo}>
    <button type="button" className="button outline-button" aria-expanded={open} aria-controls="week-demo" aria-disabled={loading} onClick={toggle}>
      {open ? 'Hide week demo' : loading ? 'Loading the week demo…' : 'Try the week demo'}
    </button>
    <p className={styles.demoHint}>Try different settings on sample data. Nothing is saved to your notebook.</p>
    <p className="sr-only" role="status">{loading || open ? status : ''}</p>
    {!loading && !open && status && <p role="alert" className={styles.demoHint}>{status}</p>}
    <div id="week-demo" hidden={!open}>{Demo && <Demo />}</div>
  </div>;
}
