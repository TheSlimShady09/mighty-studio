import { useEffect } from 'react';
import { NAV_LINKS } from '../lib/content';
import { cx } from '../lib/env';
import { useLang } from '../lib/i18n';
import { scrollToHash, useActiveSection, useScrollState } from '../hooks/useScrollState';
import Logo from './Logo';

const SECTION_IDS = NAV_LINKS.map(l => l.href);

export default function Nav({ open, setOpen }) {
  const { stuck, hidden, progress } = useScrollState(open);
  const active = useActiveSection(SECTION_IDS);
  const { t, lang, setLang, languages } = useLang();

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const handleNav = (e, href) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <>
      <div className="progress" aria-hidden="true" style={{ width: `${progress}%` }} />

      <header className={cx('nav', stuck && 'is-stuck', hidden && 'is-hidden', open && 'is-open')}>
        <a className="nav__brand" href="#hero" onClick={e => handleNav(e, '#hero')}>
          <Logo />
        </a>

        <nav className="nav__links" id="navLinks" aria-label="Primary">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              className={cx('nav__link', active === link.href && 'is-active')}
              href={link.href}
              onClick={e => handleNav(e, link.href)}
            >
              {t.nav[link.key]}
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <div className="lang" role="group" aria-label={t.nav.language}>
            {languages.map(l => (
              <button
                key={l.code}
                type="button"
                className={cx('lang__btn', lang === l.code && 'is-on')}
                aria-pressed={lang === l.code}
                lang={l.code}
                title={l.name}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <a className="nav__cta" href="#contact" onClick={e => handleNav(e, '#contact')}>
            {t.nav.cta}
          </a>
        </div>

        <button
          className="nav__burger"
          type="button"
          aria-label={t.nav.menu}
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen(v => !v)}
        >
          <i />
        </button>
      </header>
    </>
  );
}
