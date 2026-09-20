import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useParticleCamera } from '../hooks/useParticleCamera';
import { clamp, cx } from '../lib/env';
import { useLang } from '../lib/i18n';
import Logo from './Logo';

/**
 * The statement is split into per-letter layers that fly in from depth, with
 * one word carried in the script face. Words are wrapped so a line break can
 * never fall inside one, and the whole thing is keyed on the language so a
 * switch replays the entrance.
 */
function Statement({ lines, scriptWord, label, lang }) {
  let i = 0;
  const bare = word => word.replace(/[.,;:!?]/g, '').toLowerCase();

  return (
    <h1 className="wordmark" aria-label={label} key={lang}>
      {lines.map((line, row) => {
        const words = line.split(' ');
        return (
          <span className="wordmark__row" key={`${lang}-${row}`} aria-hidden="true">
            {words.map((word, w) => {
              const script = scriptWord && bare(word) === bare(scriptWord);
              return (
                <span className="wordmark__word" key={`${row}-${w}`}>
                  {[...word].map((ch, c) => (
                    <span
                      key={`${row}-${w}-${c}`}
                      className={cx('ltr', script && 'ltr--script')}
                      style={{ '--i': i++ }}
                    >
                      {ch}
                    </span>
                  ))}
                  {w < words.length - 1 && (
                    <span className="ltr ltr--space" style={{ '--i': i++ }}>
                      {' '}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

export default function Hero() {
  const { t, lang } = useLang();
  const heroRef = useRef(null);
  const innerRef = useRef(null);
  const cameraRef = useRef(null);
  const cameraHostRef = useRef(null);
  const cameraApi = useRef(null);
  const copyRef = useRef(null);

  // The camera is a point cloud; the pointer blows it apart and it settles back.
  useParticleCamera(cameraRef, cameraHostRef, cameraApi);

  // As the hero leaves, the statement sinks and blurs away while the camera
  // comes apart and falls into the page. Only the words are faded here: the
  // camera has an exit of its own, and dimming the whole block would hide it
  // before a single particle had moved.
  useScrollProgress(
    heroRef,
    p => {
      const inner = innerRef.current;
      if (inner) {
        inner.style.transform = `translate3d(0, ${(p * -130).toFixed(2)}px, 0) scale(${(1 - p * 0.1).toFixed(4)})`;
      }
      const copy = copyRef.current;
      if (copy) {
        copy.style.opacity = clamp(1 - p * 1.7, 0, 1).toFixed(3);
        copy.style.filter = p > 0.02 ? `blur(${(p * 7).toFixed(2)}px)` : 'none';
      }
      cameraApi.current?.setProgress(p);
    },
    { range: 'leaving' }
  );

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <p className="hero__side" aria-hidden="true">{t.hero.side}</p>

      <div className="hero__inner shell" ref={innerRef}>
        <div className="hero__copy" ref={copyRef}>
          <Statement
            lines={t.hero.phrase}
            scriptWord={t.hero.phraseScript}
            label={t.hero.phrase.join(' ')}
            lang={lang}
          />
          <div className="hero__sign">
            <Logo className="hero__logo" />
          </div>
        </div>

        {/* an empty box: it only reserves the camera's place in the grid.
            The cloud itself is painted on the page-wide canvas below. */}
        <div className="hero__camera" ref={cameraHostRef} aria-hidden="true" />
      </div>

      {/* Portalled to <body>: inside the hero it would be cut off by the
          section's own overflow, and pinned by the parallax transform on
          .hero__inner, so the points could never leave the square. */}
      {createPortal(
        <canvas className="particles" ref={cameraRef} aria-hidden="true" />,
        document.body
      )}

      <div className="hero__strip" aria-hidden="true">
        <span className="hero__since">{t.hero.since}</span>
        <span className="hero__scale" />
        <ul className="hero__disciplines">
          {t.hero.disciplines.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
