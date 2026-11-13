export type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

export const LANGS: Lang[] = ['de', 'en', 'fr', 'it', 'es', 'tr', 'la'];

export const LANG_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  tr: 'Türkçe',
  la: 'Latina',
};

export const LANG_CODES: Record<Lang, string> = {
  de: 'DE',
  en: 'EN',
  fr: 'FR',
  it: 'IT',
  es: 'ES',
  tr: 'TR',
  la: 'LA',
};

// Erkennte Sprache aus Browser oder Fallback Deutsch.
export function detectLang(): Lang {
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'de').toLowerCase();
  const short = nav.split('-')[0] as Lang;
  if (LANGS.includes(short)) return short;
  if (['pt', 'nl', 'pl', 'ru'].includes(short)) return 'en';
  return 'de';
}

// Saison anhand des Monats (entspricht der bisherigen Logik).
export function currentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 11) return 'autumn';
  return 'winter';
}
