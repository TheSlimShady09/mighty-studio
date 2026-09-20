import { useEffect, useRef } from 'react';
import { Ticker, clamp, lerp, prefersReducedMotion, throttleRAF } from '../lib/env';

/**
 * Depth parallax for a framed image. Returns [frameRef, layerRef]:
 * the frame is measured against the viewport, the layer is what moves.
 */
export function useParallax(depth = 0.16) {
  const frameRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer || prefersReducedMotion()) return undefined;

    const state = { current: 0, target: 0 };

    const measure = throttleRAF(() => {
      const vh = window.innerHeight;
      const rect = frame.getBoundingClientRect();
      // -1 (below the fold) → 1 (above it)
      const p = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      state.target = clamp(p, -1.2, 1.2) * depth * 100;
    });

    const tick = () => {
      state.current = lerp(state.current, state.target, 0.075);
      layer.style.transform = `translate3d(0, ${state.current.toFixed(2)}px, 0) scale(1.06)`;
    };

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
    Ticker.add(tick);

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      Ticker.remove(tick);
    };
  }, [depth]);

  return [frameRef, layerRef];
}
