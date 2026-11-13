import * as React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from '@/lib';
import { Home, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

const NAV_ITEMS: Array<{ id: string; href: (lang: Lang) => string; label: (t: (k: string) => string) => string; Icon: React.ElementType }> = [
  {
    id: 'home',
    href: (lang) => `/${lang}/`,
    label: (t) => t('navHome'),
    Icon: Home,
  },
  {
    id: 'join',
    href: (lang) => `/${lang}/join`,
    label: (t) => t('navJoin'),
    Icon: User,
  },
  {
    id: 'fame',
    href: (lang) => `/${lang}/hall-of-fame`,
    label: (t) => t('navHallOfFame'),
    Icon: Trophy,
  },
];

export function BottomNav() {
  const { lang: i18nLang, t } = useTranslation();
  const location = useLocation();
  const params = useParams<{ lang?: string }>();
  const currentLang = (params.lang as Lang) ?? i18nLang;

  const isActive = (href: string) => {
    const path = location.pathname;
    if (href.includes('join') || href.includes('bewerbung')) {
      return path.includes('join') || path.includes('bewerbung');
    }
    if (href.includes('hall-of-fame')) return path.includes('hall-of-fame');
    return path === `/${currentLang}/` || path === `/${currentLang}`;
  };

  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href(currentLang));
        const Icon = item.Icon;
        return (
          <Link
            key={item.id}
            to={item.href(currentLang)}
            className={cn('bottom-nav-item', active && 'active')}
            aria-label={item.label(t)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={19} strokeWidth={1.8} />
            <span className="bottom-nav-label">{item.label(t)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
