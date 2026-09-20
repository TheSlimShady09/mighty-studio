import { FOOTER_LEGAL, FOOTER_SERVICES, FOOTER_SOCIAL, NAV_LINKS } from '../lib/content';
import { useLang } from '../lib/i18n';
import { scrollToHash } from '../hooks/useScrollState';
import Reveal from './Reveal';
import SocialIcon from './SocialIcon';
import Logo from './Logo';

export default function Footer() {
  const { t, pick } = useLang();
  const jump = (e, href) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <Reveal className="footer__brand">
            <a className="footer__logo" href="#hero" onClick={e => jump(e, '#hero')}>
              <Logo />
            </a>
            <p className="footer__blurb">{t.footer.blurb}</p>

            <div className="footer__contact">
              <a href="mailto:mightystudio@gmail.com">mightystudio@gmail.com</a>
              <a href="https://wa.me/355692921229" target="_blank" rel="noopener noreferrer">
                +355 69 292 1229
              </a>
            </div>

            <div className="footer__social">
              {FOOTER_SOCIAL.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer__social-link"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal className="footer__col" delay={70}>
            <h5>{t.footer.index}</h5>
            <ul className="footer__links">
              {NAV_LINKS.map(l => (
                <li key={l.key}>
                  <a href={l.href} onClick={e => jump(e, l.href)}>
                    {t.nav[l.key]}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="footer__col" delay={140}>
            <h5>{t.footer.services}</h5>
            <ul className="footer__links">
              {FOOTER_SERVICES.map(l => (
                <li key={l.en}>
                  <a href={l.href} onClick={e => jump(e, l.href)}>
                    {pick(l)}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} {t.footer.copyright}</span>

          <nav className="footer__legal" aria-label={t.footer.legalLabel}>
            {FOOTER_LEGAL.map(l => (
              <a key={l.en} href={l.href} onClick={e => jump(e, l.href)}>
                {pick(l)}
              </a>
            ))}
          </nav>

        </div>
      </div>
    </footer>
  );
}
