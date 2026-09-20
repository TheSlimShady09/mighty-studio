import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES, UI } from './content';

const STORAGE_KEY = 'mighty-lang';
const LangContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && UI[saved]) return saved;
  } catch {
    /* private mode; fall through to the browser preference */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return nav.toLowerCase().startsWith('sq') ? 'sq' : 'en';
}

/**
 * Language state for the whole page.
 *
 * `t` is the UI dictionary for the active language; `pick` reads the matching
 * field off any record that carries `en` / `sq` alongside its own data, which
 * is how lists keep their images tied to their captions.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* nothing to do: the choice just will not persist */
    }
  }, [lang]);

  const pick = useCallback(item => (item ? item[lang] ?? item.en : undefined), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t: UI[lang], pick, languages: LANGUAGES }),
    [lang, pick]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
