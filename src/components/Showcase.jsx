import { useCallback, useEffect, useRef, useState } from 'react';
import { SHOWCASE } from '../lib/content';
import { cx, prefersReducedMotion } from '../lib/env';
import { useLang } from '../lib/i18n';
import Reveal from './Reveal';

const HOLD = 6000; // ms a slide stays before it advances itself

const pad = n => String(n).padStart(2, '0');

/**
 * A slow, self-advancing slideshow of the kinds of work the studio takes on.
 *
 * Slides cross-fade with a long Ken Burns drift. It keeps advancing whatever
 * the pointer is doing, holding only for the length of a drag. Reduced motion
 * stops it entirely, and the tabs below give direct access to every slide.
 */
export default function Showcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef({ x: 0, active: false, id: null });
  const { t, pick } = useLang();

  const count = SHOWCASE.length;
  const go = useCallback(i => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // self-advance
  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const timer = setTimeout(() => setIndex(i => (i + 1) % count), HOLD);
    return () => clearTimeout(timer);
  }, [index, paused, count]);

  // swipe
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const down = e => {
      drag.current = { x: e.clientX, active: true, id: e.pointerId };
      setDragging(true);
      setPaused(true);
    };
    const up = e => {
      const d = drag.current;
      if (!d.active || (e.pointerId !== undefined && e.pointerId !== d.id)) return;
      d.active = false;
      setDragging(false);
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 44) (dx < 0 ? next : prev)();
      setPaused(false);
    };

    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    return () => {
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
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
          {SHOWCASE.map((slide, i) => (
            <figure
              key={slide.id}
              className={cx('slide', i === index && 'is-on')}
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
          ))}

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
                  <i
                    key={`${slide.id}-${index}-${paused}`}
                    style={{
                      animationDuration: `${HOLD}ms`,
                      animationPlayState: paused ? 'paused' : 'running'
                    }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
