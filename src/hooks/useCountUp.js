import { useEffect, useState } from 'react';
import { Ease, clamp, prefersReducedMotion } from '../lib/env';

/** Counts from 0 to `end` on an outExpo curve once `start` turns true. */
export function useCountUp(end, start, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    if (prefersReducedMotion()) {
      setValue(end);
      return undefined;
    }

    let raf = 0;
    const t0 = performance.now();

    const step = now => {
      const t = clamp((now - t0) / duration, 0, 1);
      setValue(Math.round(end * Ease.outExpo(t)));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, start, duration]);

  return value;
}
