import { useParams } from 'react-router-dom';
import { useTranslation } from '@/lib';
import { Github } from 'lucide-react';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

export function Footer() {
  const { lang, t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = (params.lang as Lang) ?? lang;

  const links = [
    { href: `/${currentLang}/`, label: t('navHome') },
    { href: `#projekte`, label: t('navProjects') },
    { href: `/${currentLang}/join`, label: t('navJoin') },
    { href: `/${currentLang}/hall-of-fame`, label: t('navHallOfFame') },
    { href: `/${currentLang}/changelog`, label: t('navChangelog') },
    { href: `/${currentLang}/roadmap`, label: t('navRoadmap') },
    { href: `/${currentLang}/settings`, label: t('navSettings') },
    { href: `/${currentLang}/branding`, label: t('navBranding') },
    { href: `/${currentLang}/bd`, label: t('navBirthday') },
    { href: `/${currentLang}/impressum`, label: t('navImpressum') },
    { href: `/${currentLang}/datenschutz`, label: t('navDatenschutz') },
  ];

  const network = [
    { href: 'https://github.com/Lokrogaming', label: t('footerGitHub') },
    { href: 'https://os.lokro.dev', label: t('footerOs') },
    { href: 'https://nucord.lokro.dev', label: t('footerNucord') },
  ];

  return (
    <footer className="border-t border-c pt-12 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/assets/lokro-white.png"
                alt="LOKRO"
                className="h-4 w-auto dark-logo hidden"
                aria-hidden="true"
              />
              <img
                src="/assets/lokro-black.png"
                alt="LOKRO"
                className="h-4 w-auto light-logo hidden"
                aria-hidden="true"
              />
            </div>
            <p className="font-mono text-xs dim max-w-md leading-relaxed mt-4">
              {t('footerSubline')}
            </p>
            <div className="flex flex-wrap gap-2 mt-5 font-mono text-xs">
              {['de', 'en', 'fr', 'it', 'es', 'tr', 'la'].map((l) => (
                <a key={l} href={`/${l}/`} className="chip chamfer-sm">
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-6 font-mono text-xs muted">
            <div className="flex flex-col gap-3">
              <span className="dim tracking-widest">{t('footerPages')}</span>
              {links.map((l) => (
                <a key={l.href} href={l.href} className="hover:opacity-70 transition">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="dim tracking-widest">{t('footerNetwork')}</span>
              {network.map((n) => (
                <a key={n.href} href={n.href} className="hover:opacity-70 transition">
                  {n.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-c pt-8 flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs dim">
          <span>LOKRO V2.1.0 &lt;-&gt; Carrotcake</span>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Lokrogaming/lokrogaming.github.io"
              className="flex items-center gap-1 hover:opacity-70 transition"
            >
              <Github size={14} /> GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
