import { useRef, useState } from 'react';
import { BUDGETS, PROJECT_TYPES } from '../lib/content';
import { cx } from '../lib/env';
import { useLang } from '../lib/i18n';
import Reveal, { Lines } from './Reveal';

/** Enquiries are handed to the studio's WhatsApp, prefilled. */
const WHATSAPP = '355692921229';

const EMPTY = { name: '', email: '', type: '', budget: '', message: '' };

function Field({ id, name, label, error, focused, onFocus, onBlur, children }) {
  return (
    <div className={cx('field', focused && 'is-focus', error && 'is-invalid')}>
      <label htmlFor={id}>{label}</label>
      {children({ id, name, onFocus, onBlur, 'aria-invalid': error ? 'true' : 'false' })}
      <span className="field__err">{error || ''}</span>
    </div>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focus, setFocus] = useState(null);
  const [status, setStatus] = useState('idle');
  const formRef = useRef(null);
  const { t, pick, lang } = useLang();

  const rules = {
    name: v => (v.trim().length >= 2 ? '' : t.contact.errName),
    email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : t.contact.errEmail),
    type: v => (v ? '' : t.contact.errType),
    budget: () => '',
    message: v => (v.trim().length >= 12 ? '' : t.contact.errMessage)
  };

  const validate = (field, value) => (rules[field] ? rules[field](value) : '');

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
    // only surface an error once the field has been left at least once
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setFocus(null);
    setTouched(s => ({ ...s, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  /** Everything the studio needs, laid out as a readable message. */
  const buildMessage = () => {
    const type = PROJECT_TYPES.find(o => o.value === values.type);
    const budget = BUDGETS.find(o => o.value === values.budget);
    const lines = [
      `${t.contact.name}: ${values.name}`,
      `${t.contact.email}: ${values.email}`,
      `${t.contact.project}: ${type ? pick(type) : '—'}`
    ];
    if (budget) lines.push(`${t.contact.budget}: ${pick(budget)}`);
    lines.push('', values.message.trim());
    return lines.join('\n');
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (status === 'sending') return;

    const next = {};
    let firstBad = null;
    Object.keys(rules).forEach(field => {
      const msg = validate(field, values[field]);
      next[field] = msg;
      if (msg && !firstBad) firstBad = field;
    });

    setTouched(Object.fromEntries(Object.keys(rules).map(k => [k, true])));
    setErrors(next);

    if (firstBad) {
      setStatus('invalid');
      formRef.current?.querySelector(`[name="${firstBad}"]`)?.focus();
      return;
    }

    // Opened straight from the submit gesture so the browser treats it as a
    // user action rather than a popup.
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus('sent');
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setStatus('idle');
    setTimeout(() => formRef.current?.querySelector('[name="name"]')?.focus(), 0);
  };

  const fieldProps = name => ({
    name,
    error: touched[name] ? errors[name] : '',
    focused: focus === name,
    onFocus: () => setFocus(name),
    onBlur: handleBlur
  });

  const statusText =
    status === 'sending' ? t.contact.transmitting : status === 'invalid' ? t.contact.checkFields : '';

  return (
    <section className="section section--light" id="contact">
      <div className="shell">
        <Reveal as="p" variant="fade" className="eyebrow">
          {t.contact.eyebrow}
        </Reveal>

        <div className="grid12 contact__grid" style={{ marginTop: 'clamp(2rem,4vw,3.5rem)' }}>
          <div className="contact__aside">
            <Lines as="h2" className="contact__big title" lines={t.contact.title} />
            <Reveal as="p" className="muted measure" delay={140}>
              {t.contact.body}
            </Reveal>
            <Reveal className="contact__links" delay={220}>
              <a href="mailto:studio@mightystudio.com">studio@mightystudio.com</a>
              <a href="https://wa.me/355692921229" target="_blank" rel="noopener noreferrer">
                +355 69 292 1229
              </a>
            </Reveal>
            <Reveal as="p" className="muted" delay={300}>
              {t.contact.address}
            </Reveal>
          </div>

          <Reveal variant="right" className="contact__form" delay={120}>
            <form
              className="form"
              ref={formRef}
              noValidate
              hidden={status === 'sent'}
              onSubmit={handleSubmit}
            >
              <div className="form__row">
                <Field id="f-name" label={t.contact.name} {...fieldProps('name')}>
                  {p => (
                    <input
                      {...p}
                      type="text"
                      placeholder={t.contact.namePlaceholder}
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                    />
                  )}
                </Field>
                <Field id="f-email" label={t.contact.email} {...fieldProps('email')}>
                  {p => (
                    <input
                      {...p}
                      type="email"
                      placeholder={t.contact.emailPlaceholder}
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                    />
                  )}
                </Field>
              </div>

              <div className="form__row">
                <Field id="f-type" label={t.contact.project} {...fieldProps('type')}>
                  {p => (
                    <select {...p} value={values.type} onChange={handleChange}>
                      <option value="">{t.contact.projectPlaceholder}</option>
                      {PROJECT_TYPES.map(o => (
                        <option key={o.value} value={o.value}>
                          {pick(o)}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field id="f-budget" label={t.contact.budget} {...fieldProps('budget')}>
                  {p => (
                    <select {...p} value={values.budget} onChange={handleChange}>
                      <option value="">{t.contact.budgetPlaceholder}</option>
                      {BUDGETS.map(o => (
                        <option key={o.value} value={o.value}>
                          {pick(o)}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              <Field id="f-msg" label={t.contact.brief} {...fieldProps('message')}>
                {p => (
                  <textarea
                    {...p}
                    rows={4}
                    placeholder={t.contact.briefPlaceholder}
                    value={values.message}
                    onChange={handleChange}
                  />
                )}
              </Field>

              <div className="form__foot">
                <button className="btn" type="submit" lang={lang}>
                  <span className="btn__dot" />
                  <span>{t.contact.send}</span>
                </button>
                <p className="form__status" role="status" aria-live="polite">
                  {statusText}
                </p>
              </div>
            </form>

            <div className="form__sent" hidden={status !== 'sent'}>
              <h3 className="h3">{t.contact.sentTitle}</h3>
              <p className="muted">{t.contact.sentBody}</p>
              <button className="totop" type="button" onClick={reset}>
                {t.contact.sendAnother}
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
