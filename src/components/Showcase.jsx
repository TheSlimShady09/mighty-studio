import { useCallback, useEffect, useRef, useState } from 'react';
import { SHOWCASE } from '../lib/content';
import { cx, isCoarsePointer, prefersReducedMotion } from '../lib/env';
import { useLang } from '../lib/i18n';
import Reveal from './Reveal';

const HOLD = 6000; // ms a slide stays before it advances itself
const THRESHOLD = 0.16; // share of the width that counts as a committed swipe
const FLICK = 0.45; // px/ms — a short, fast flick also commits

const pad = n => String(n).padStart(2, '0');

/**
 * Signed distance from the active slide, taking the short way round, so the
 * deck can be dragged past either end without ever hitting a wall.
 */
function offsetOf(i, index, count) {
  let d = i - index;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/**
 * A self-advancing slideshow of the kinds of work the studio takes on.
 *
 * The slides sit on a rail: each one is parked at its own multiple of 100%
 * and the whole rail carries the drag, so a swipe moves the artwork under the
 * finger in real time and the release only decides where it lands. Slides
 * push each other out of frame rather than cross-fading. It never stops for
 * the pointer — hovering, touching and dragging all leave the clock running.
 */
export default function Showcase() {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef(null);
  const { t, pick } = useLang();

  const count = SHOWCASE.length;
  const go = useCallback(i => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

  // The clock runs whatever the pointer is doing: it is never paused, only
  // re-armed each time the slide changes, however it changed. If it comes
  // round while a finger is down, the step is allowed to ease rather than
  // cut, so the deck glides forward under the hand instead of jumping.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const timer = setTimeout(() => {
      if (drag.current && stageRef.current) stageRef.current.classList.add('is-stepping');
      next();
    }, HOLD);
    return () => clearTimeout(timer);
  }, [index, next]);

  // Touch only. On a mouse the deck is not a control at all: no listeners
  // are attached, so a cursor crossing it cannot reach anything, and it
  // simply keeps running.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isCoarsePointer()) return undefined;

    const down = e => {
      if (e.button !== undefined && e.button !== 0) return;
      drag.current = { x: e.clientX, id: e.pointerId, t: performance.now(), last: e.clientX };
      setDragging(true);
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety; the window listeners below are the guarantee */
      }
    };

    const move = e => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      d.last = e.clientX;
      // the finger has taken over from any easing step still running
      stage.classList.remove('is-stepping');
      // Written straight to the element. Putting this in React state would
      // re-render all five slides and the caption on every pointer event,
      // which is what made the drag stutter under the cursor.
      stage.style.setProperty('--dx', `${e.clientX - d.x}px`);
    };

    const up = e => {
      const d = drag.current;
      if (!d || (e.pointerId !== undefined && e.pointerId !== d.id)) return;
      drag.current = null;
      setDragging(false);
      stage.classList.remove('is-stepping');
      stage.style.setProperty('--dx', '0px');

      const dx = (e.clientX ?? d.last) - d.x;
      const dt = Math.max(1, performance.now() - d.t);
      const speed = Math.abs(dx) / dt;
      const travelled = Math.abs(dx) / Math.max(1, stage.clientWidth);
      if (travelled > THRESHOLD || (speed > FLICK && Math.abs(dx) > 28)) {
        (dx < 0 ? next : prev)();
      }
    };

    const cancel = () => {
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      stage.classList.remove('is-stepping');
      stage.style.setProperty('--dx', '0px');
    };

    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', cancel);
    return () => {
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', cancel);
    };
  }, [next, prev]);

  const onKeyDown = e => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  const current = pick(SHOWCASE[index]);

  return (
    <section className="section showcase" id="work">
      <div className="shell">
        <div className="showcase__head">
          <div>
            <Reveal as="p" variant="fade" className="eyebrow">
              {t.showcase.eyebrow}
            </Reveal>
            <Reveal as="h2" className="title" delay={80} style={{ marginTop: '1rem' }}>
              {t.showcase.title}
            </Reveal>
          </div>
          <Reveal as="p" variant="right" className="lead showcase__intro" delay={140}>
            {t.showcase.intro}
          </Reveal>
        </div>
      </div>

      <Reveal className="showcase__stage" variant="clip">
        <div
          className={cx('showcase__frames', dragging && 'is-dragging')}
          ref={stageRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={t.showcase.label}
          onKeyDown={onKeyDown}
        >
          {SHOWCASE.map((slide, i) => {
            const o = offsetOf(i, index, count);
            const near = Math.abs(o) <= 1;
            return (
              <figure
                key={slide.id}
                className={cx('slide', i === index && 'is-on', near && 'is-near')}
                style={{ '--o': o }}
                aria-hidden={i === index ? 'false' : 'true'}
              >
                <img
                  src={slide.src}
                  alt={pick(slide).alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable="false"
                />
              </figure>
            );
          })}

          <div className="showcase__scrim" aria-hidden="true" />

          <p className="showcase__hint" aria-hidden="true">
            <span />
            {t.showcase.hint}
          </p>

          <div className="showcase__caption">
            <p className="showcase__count">
              {pad(index + 1)} <span>/ {pad(count)}</span>
            </p>
            <h3 className="showcase__name title" key={SHOWCASE[index].id}>
              {current.name}
            </h3>
            <p className="showcase__desc">{current.desc}</p>
          </div>
        </div>
      </Reveal>

      <div className="shell">
        <ol className="showcase__tabs" role="tablist" aria-label={t.showcase.tabs}>
          {SHOWCASE.map((slide, i) => (
            <li key={slide.id}>
              <button
                type="button"
                role="tab"
                aria-selected={i === index}
                className={cx('showcase__tab', i === index && 'is-on')}
                onClick={() => go(i)}
              >
                <span className="showcase__tabnum">{pad(i + 1)}</span>
                <span className="showcase__tabname">{pick(slide).name}</span>
                <span className="showcase__tabbar" aria-hidden="true">
                  <i key={`${slide.id}-${index}`} style={{ animationDuration: `${HOLD}ms` }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
