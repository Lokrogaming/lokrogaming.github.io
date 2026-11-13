import { useCallback, useEffect, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { LANGS, detectLang } from '@/lib/i18n';
import de from '@/locales/de';
import en from '@/locales/en';
import fr from '@/locales/fr';
import it from '@/locales/it';
import es from '@/locales/es';
import tr from '@/locales/tr';
import la from '@/locales/la';

const LOCALES: Record<Lang, Record<string, string>> = { de, en, fr, it, es, tr, la };

const LANG_KEY = 'lokro-language';

export function useTranslation() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && LANGS.includes(stored as Lang)) return stored as Lang;
    } catch {}
    return detectLang();
  });

  useEffect(() => {
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string): string => {
      const strings = LOCALES[lang];
      return strings[key] ?? LOCALES.de[key] ?? key;
    },
    [lang]
  );

  const setLanguage = useCallback((next: Lang) => {
    setLang(next);
  }, []);

  return { lang, t, setLanguage, languages: LANGS };
}
