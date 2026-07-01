'use client';

import { useEffect } from 'react';
import { applyTextScaleClass, readTextScale } from '@/lib/textScalePrefs';

/** Applies persisted text scale class on document root. */
export function TextScaleInit() {
  useEffect(() => {
    applyTextScaleClass(readTextScale());
  }, []);
  return null;
}
