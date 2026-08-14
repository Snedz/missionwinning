'use client';

import { useEffect, useState } from 'react';
import { visualViewportKeyboardOverlap } from '@/lib/visualViewportKeyboard';

/**
 * Pixels of the layout viewport covered by the software keyboard.
 * 0 when visualViewport is missing (desktop) or the keyboard is closed.
 */
export function useVisualViewportKeyboardOverlap(): number {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      setOverlap(
        visualViewportKeyboardOverlap({
          innerHeight: window.innerHeight,
          visualHeight: vv.height,
          visualOffsetTop: vv.offsetTop,
        })
      );
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  return overlap;
}
