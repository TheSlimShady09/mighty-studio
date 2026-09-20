import { useEffect, useRef, useState } from 'react';
import { throttleRAF } from '../lib/env';

/**
 * Sticky/hide state for the nav plus the reading-progress width.
 * `menuOpen` keeps the bar pinned while the mobile panel is showing.
 */
export function useScrollState(menuOpen) {
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = throttleRAF(() => {
      const y = window.scrollY;
      setStuck(y > 24);
      setHidden(y > lastY.current && y > 260);
      lastY.current = y;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { stuck, hidden: hidden && !menuOpen, progress };
}

/** Tracks which section is under the reading line, for the nav's active link. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const sections = ids
      .map(id => document.getElementById(id.replace('#', '')))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) setActive(`#${en.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/** Smooth-scrolls to an anchor and keeps the URL hash in step. */
export function scrollToHash(href, onDone) {
  const target = document.querySelector(href);
  if (!target) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = href === '#hero' ? 0 : target.getBoundingClientRect().top + window.scrollY - 10;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  if (window.history.replaceState) window.history.replaceState(null, '', href);
  if (onDone) onDone();
}
