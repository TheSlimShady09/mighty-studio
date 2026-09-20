import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, throttleRAF } from '../lib/env';

/**
 * Scroll reveals, driven by one shared sweep rather than one observer per
 * element.
 *
 * IntersectionObserver alone is not reliable here: it only queues an entry
 * when a threshold is actually crossed in a sampled frame. A fast flick, an
 * anchor jump, or simply a slow device can carry an element from below the
 * fold to above it between two frames, and the element is then never reported
 * at all — it would stay invisible for the rest of the session.
 *
 * So the registry is swept on scroll instead: an element reveals as soon as
 * its top has risen into the lower part of the viewport, which is also true
 * of anything that has already scrolled past. Each element is measured only
 * while it is still waiting, and the listener detaches once the page is done.
 */
const pending = new Map();
let listening = false;

const TRIGGER = 0.9; // reveal once the top reaches 90% of the viewport height

function sweep() {
  if (!pending.size) return;

  const limit = window.innerHeight * TRIGGER;
  const done = [];

  pending.forEach((notify, el) => {
    const rect = el.getBoundingClientRect();
    // covers both "entering from below" and "already gone past the top"
    if (rect.top < limit) done.push([el, notify]);
  });

  done.forEach(([el, notify]) => {
    pending.delete(el);
    notify();
  });

  if (pending.size === 0) stopListening();
}

const onScroll = throttleRAF(sweep);

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
}

/**
 * Returns [ref, shown]. `shown` flips once the element scrolls into view, or
 * immediately when the visitor asked for reduced motion.
 */
export function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      setShown(true);
      return undefined;
    }

    pending.set(el, () => setShown(true));
    startListening();
    // check straight away: the element may already be in view on mount
    onScroll();

    return () => {
      pending.delete(el);
      if (pending.size === 0) stopListening();
    };
  }, []);

  return [ref, shown];
}
