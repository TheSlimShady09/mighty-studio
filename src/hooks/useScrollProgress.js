import { useEffect, useRef } from 'react';
import { Ticker, clamp, lerp, prefersReducedMotion, throttleRAF } from '../lib/env';

/**
 * Scroll-linked motion for a single element.
 *
 * `apply(p)` receives a smoothed 0→1 value describing how far the element has
 * travelled through the viewport, and writes styles directly. Nothing here
 * touches React state, so a scroll never triggers a render.
 *
 * range: 'through'  0 when the element's top hits the bottom of the viewport,
 *                   1 when its bottom leaves the top.
 *        'leaving'  0 while the element fills the viewport, 1 once its bottom
 *                   has scrolled past the top (used for the hero).
 */
export function useScrollProgress(ref, apply, { range = 'through', ease = 0.16 } = {}) {
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      applyRef.current(range === 'leaving' ? 0 : 1, el);
      return undefined;
    }

    const state = { current: 0, target: 0 };

    const measure = throttleRAF(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        range === 'leaving'
          ? -rect.top / Math.max(1, rect.height)
          : (vh - rect.top) / Math.max(1, vh + rect.height);
      state.target = clamp(p, 0, 1);
    });

    const tick = () => {
      state.current = lerp(state.current, state.target, ease);
      applyRef.current(state.current, el);
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
  }, [ref, range, ease]);
}

/**
 * Publishes scroll velocity as a document-level custom property (`--vel`,
 * roughly -1→1). Sections read it to skew or drift while the page is moving,
 * which is what makes a long scroll feel like one continuous material.
 */
export function useScrollVelocity() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const root = document.documentElement;
    let lastY = window.scrollY;
    let velocity = 0;
    let smoothed = 0;

    const measure = throttleRAF(() => {
      const y = window.scrollY;
      velocity = clamp((y - lastY) / 34, -1, 1);
      lastY = y;
    });

    const tick = () => {
      smoothed = lerp(smoothed, velocity, 0.1);
      velocity = lerp(velocity, 0, 0.08);
      root.style.setProperty('--vel', smoothed.toFixed(4));
    };

    window.addEventListener('scroll', measure, { passive: true });
    Ticker.add(tick);

    return () => {
      window.removeEventListener('scroll', measure);
      Ticker.remove(tick);
      root.style.removeProperty('--vel');
    };
  }, []);
}

/**
 * A block that swings through the page plane as it passes the viewport:
 * tilted back on the way in, flat at centre, tilted away on the way out.
 *
 * Writes an inline transform, so attach it to an element that nothing else
 * transforms (a wrapper, never a Reveal target).
 */
export function useScroll3D(ref, { max = 8, depth = 70 } = {}) {
  useScrollProgress(ref, (p, el) => {
    const t = (p - 0.5) * 2; // -1 entering … 0 centred … 1 leaving
    const rot = (-t * max).toFixed(2);
    const z = (-Math.abs(t) * depth).toFixed(1);
    el.style.transform = `perspective(1500px) rotateX(${rot}deg) translate3d(0,0,${z}px)`;
  });
}
