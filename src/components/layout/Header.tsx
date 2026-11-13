import * as React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/lib';
import { cn } from '@/lib/utils';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

const LANG_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  tr: 'Türkçe',
  la: 'Latina',
};

const LANG_CODES: Record<Lang, string> = {
  de: 'DE',
  en: 'EN',
  fr: 'FR',
  it: 'IT',
  es: 'ES',
  tr: 'TR',
  la: 'LA',
};

interface LanguageSwitchProps {
  currentLang: Lang;
  onChange: (l: Lang) => void;
}

function LanguageSwitch({ currentLang, onChange }: LanguageSwitchProps) {
  const { t, languages } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lang-wrap" onClick={(e) => e.stopPropagation()}>
      <button
        className="lang-btn chamfer-sm"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('langAria')}
        onClick={() => setOpen((o) => !o)}
      >
        {currentLang.toUpperCase()} <span className="lang-caret">▼</span>
      </button>
      <div className={cn('lang-menu chamfer-sm', open ? 'open' : '')} role="menu">
        {languages.map((l) => (
          <a
            key={l}
            className={cn('lang-option', l === currentLang && 'current')}
            data-lang={l}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              onChange(l);
            }}
          >
            {LANG_LABELS[l]} <span className="code">{LANG_CODES[l]}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const { lang: i18nLang, t, setLanguage } = useTranslation();
  const location = useLocation();
  const params = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const currentLang = (params.lang as Lang) ?? i18nLang;

  const suffix = location.pathname.replace(new RegExp(`^/${currentLang}`), '') || '/';

  const goLang = (l: Lang) => {
    const target = suffix === '/' ? `/${l}` : `/${l}${suffix}`;
    setLanguage(l);
    navigate(target, { replace: true });
  };

  // Theme state
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');
  const root = document.documentElement;

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('lokro-theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored);
    } catch {}
  }, []);

  React.useEffect(() => {
    const apply = (t: 'light' | 'dark' | 'system') => {
      if (t === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('light', !prefersDark);
      } else {
        root.classList.toggle('light', t === 'light');
      }
    };
    apply(theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') apply('system');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    try { localStorage.setItem('lokro-theme', next); } catch {}
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
        <Link to={`/${currentLang}/`} className="flex items-center gap-2" aria-label="LOKRO Startseite">
          <img
            src="/assets/lokro-white.png"
            alt="LOKRO"
            className="h-6 w-auto dark-logo hidden"
            aria-hidden="true"
          />
          <img
            src="/assets/lokro-black.png"
            alt="LOKRO"
            className="h-6 w-auto light-logo hidden"
            aria-hidden="true"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-mono muted" aria-label="Hauptnavigation">
          <Link to={`/${currentLang}/#mission`} className="hover:opacity-70 transition">
            {t('navMission')}
          </Link>
          <Link to={`/${currentLang}/#projekte`} className="hover:opacity-70 transition">
            {t('navProjects')}
          </Link>
          <Link to={`/${currentLang}/#werte`} className="hover:opacity-70 transition">
            {t('navValues')}
          </Link>
          <Link to={`/${currentLang}/#team`} className="hover:opacity-70 transition">
            {t('navTeam')}
          </Link>
          <Link to={`/${currentLang}/#community`} className="hover:opacity-70 transition">
            {t('navCommunity')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch currentLang={currentLang} onChange={goLang} />
          <button
            onClick={toggleTheme}
            aria-label={t('themeAria')}
            className="theme-toggle-track relative w-12 h-7 rounded-full flex items-center px-1"
          >
            <span
              id="theme-knob"
              className="block w-5 h-5 rounded-full transition-transform duration-300"
              style={{
                background: 'var(--fg)',
                transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)',
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
