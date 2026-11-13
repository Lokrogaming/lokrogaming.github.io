import { useEffect } from 'react';
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

export default function App() {
  const { lang: i18nLang } = useTranslation();
  const location = useLocation();

  // Von der 404.html weitergeleitete Hash-Pfade (/index.html#/de/join) in
  // echte BrowserRouter-Pfade umwandeln, ohne die Seite neu zu laden.
  useEffect(() => {
    var hash = window.location.hash;
    if (hash.startsWith('#/')) {
      var path = decodeURIComponent(hash.slice(1));
      window.history.replaceState({}, '', path);
      window.location.hash = '';
    }
  }, []);

  const redirectTo = (lang: Lang, pathname: string) => {
    const hasSuffix = pathname.length > 1 && pathname !== '/';
    return `/${lang}${hasSuffix ? pathname : '/'}`;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={redirectTo(i18nLang, location.pathname)}
            replace
          />
        }
      />
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
      <Route path="*">
        <Navigate to={redirectTo(i18nLang, '/')} replace />
      </Route>
    </Routes>
  );
}
