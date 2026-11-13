import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@/lib';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Join } from '@/pages/Join';
import { HallOfFame } from '@/pages/HallOfFame';
import { Changelog } from '@/pages/Changelog';
import { Roadmap } from '@/pages/Roadmap';
import { Settings } from '@/pages/Settings';
import { Branding } from '@/pages/Branding';
import { Birthday } from '@/pages/Birthday';
import { Impressum, Datenschutz } from '@/pages/Legal';
import { NotFound } from '@/pages/NotFound';
import type { Lang } from '@/lib';

const LANGS: Lang[] = ['de', 'en', 'fr', 'it', 'es', 'tr', 'la'];

export default function App() {
  const { lang: i18nLang } = useTranslation();
  const location = useLocation();
  const [initialPath, setInitialPath] = useState<string | null>(null);

  // Von der 404.html übermittelter Pfad (SPA-Fallback für Direktaufrufe von Unterseiten auf GitHub Pages)
  useEffect(() => {
    var path = null;
    try { path = localStorage.getItem('__spa_path'); } catch {}
    if (path) {
      try { localStorage.removeItem('__spa_path'); } catch {}
      setInitialPath(path);
    }
  }, []);

  const redirectTo = (lang: Lang, pathname: string) => {
    const hasSuffix = pathname.length > 1 && pathname !== '/';
    return `/${lang}${hasSuffix ? pathname : '/'}`;
  };

  // Root "/" -> auf erkannte/gespeicherte Sprache umleiten.
  if (location.pathname === '/' || location.pathname === '') {
    return <Navigate to={redirectTo(i18nLang, '/')} replace />;
  }

  const langSegment = location.pathname.split('/')[1];
  const valid = LANGS.includes(langSegment as Lang);

  if (!valid) {
    return <Navigate to={redirectTo(i18nLang, '/')} replace />;
  }

  // Wenn ein gespeicherter Pfad vorliegt, einmalig dorthin navigieren.
  if (initialPath) {
    return <Navigate to={initialPath} replace />;
  }

  return (
    <Routes>
      <Route path=":lang/*" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="join" element={<Join />} />
        <Route path="hall-of-fame" element={<HallOfFame />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="settings" element={<Settings />} />
        <Route path="branding" element={<Branding />} />
        <Route path="bd" element={<Birthday />} />
        <Route path="impressum" element={<Impressum />} />
        <Route path="datenschutz" element={<Datenschutz />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
