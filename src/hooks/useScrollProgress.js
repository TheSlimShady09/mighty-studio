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

    // The lerp never lands on its target by itself, so it is snapped once it
    // is close enough and the same value is never applied twice. Without this
    // the hero keeps rewriting identical transforms for the whole length of
    // the page, long after it has left the screen.
    let applied = -1;
    const tick = () => {
      state.current = lerp(state.current, state.target, ease);
      if (Math.abs(state.current - state.target) < 0.0002) state.current = state.target;
      if (state.current === applied) return;
      applied = state.current;
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

    // `--vel` is an inherited custom property on the root, so every write
    // invalidates style for the entire document. Writing one per frame for
    // the life of the page cost more main-thread time than everything else
    // on it put together; it is now written only when the value it would
    // publish has actually changed, which means never while the page is
    // still.
    let published = null;
    const tick = () => {
      smoothed = lerp(smoothed, velocity, 0.1);
      velocity = lerp(velocity, 0, 0.08);
      const v = smoothed.toFixed(3);
      if (v === published) return;
      published = v;
      root.style.setProperty('--vel', v);
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
