import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib';
import { getPocketBase } from '@/lib/pocketbase';
import { Github, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HallOfFameEntry {
  name: string;
  role: string;
  description: string;
  avatar?: string;
  link?: string;
  featured?: boolean;
}

const FALLBACK_FAME: HallOfFameEntry[] = [
  {
    name: 'Lokrogamer',
    role: 'Founder & Developer',
    description: 'Gründer von LOKRO. Verantwortlich für Entwicklung, Infrastruktur und die Vision hinter dem gesamten Netzwerk.',
    link: 'https://github.com/lokrogaming',
    featured: true,
  },
  {
    name: 'Leon Sprenger',
    role: 'Manager & Partner (LS)',
    description: 'Co-Owner von LOKRO. Bringt Management-Erfahrung und Unterstützung mit, um LOKRO als seriöse Marke zu etablieren.',
    link: '',
    featured: true,
  },
  {
    name: 'Gretaj512',
    role: 'Supporter*in',
    description: 'Unterstützt uns seit Tag 1',
    link: 'https://instagram.com/gretaj512',
    featured: true,
  },
];

export function HallOfFame() {
  const { t } = useTranslation();
  const pb = getPocketBase();

  const [entries, setEntries] = useState<HallOfFameEntry[]>(FALLBACK_FAME);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const records = await pb.collection('hall_of_fame').getFullList<HallOfFameEntry>({
          sort: '-featured,-created',
        });
        if (mounted && records.length > 0) setEntries(records as unknown as HallOfFameEntry[]);
      } catch {
        // Fallback bleibt bestehen.
      }
    })();
    return () => { mounted = false; };
  }, [pb]);

  const featured = entries.filter((e) => e.featured);
  const others = entries.filter((e) => !e.featured);

  const authorLink = (url?: string): string | undefined => {
    if (!url) return undefined;
    return url;
  };

  const AuthorIcon = ({ url }: { url?: string }) => {
    if (!url) return <Github size={18} />;
    if (url.includes('instagram.com')) return <Instagram size={18} />;
    return <Github size={18} />;
  };

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal mb-12 in">
          <div className="eyebrow mb-4">{t('fameEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">{t('fameTitlePage')}</h2>
          <p className="mt-6 muted leading-relaxed max-w-2xl">{t('fameIntro')}</p>
        </div>

        {featured.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            {featured.map((entry) => (
              <div
                key={entry.name}
                className={cn('card chamfer p-8 reveal reveal-d1 honor-card', entry.featured && 'featured')}
              >
                <div className="avatar-ring mb-6" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl" style={{ color: 'var(--gold)' }}>
                      {entry.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-center">{entry.name}</h3>
                <div className="font-mono text-xs dim text-center mb-4">{entry.role}</div>
                <p className="text-sm muted leading-relaxed text-center mb-6">{entry.description}</p>
                {(() => {
                  const linkUrl = entry.link ? authorLink(entry.link) : undefined;
                  if (!linkUrl) return null;
                  return (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-tile"
                    >
                      <div className="link-tile-icon">{<AuthorIcon url={linkUrl} />}</div>
                      <div className="link-tile-text">
                        <div className="link-tile-title">{entry.name}</div>
                        <div className="link-tile-subtitle">{new URL(linkUrl).hostname}</div>
                      </div>
                      <span className="link-tile-arrow">→</span>
                    </a>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((entry) => (
              <div key={entry.name} className="card chamfer p-7 reveal reveal-d2 honor-card">
                <div className="avatar-ring mb-4" style={{ width: '56px', height: '56px' }}>
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold" style={{ color: 'var(--gold)' }}>
                      {entry.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>
                <h3 className="font-display font-semibold">{entry.name}</h3>
                <div className="font-mono text-xs dim mb-3">{entry.role}</div>
                <p className="text-sm muted leading-relaxed">{entry.description}</p>
                {(() => {
                  const linkUrl = entry.link ? authorLink(entry.link) : undefined;
                  if (!linkUrl) return null;
                  return (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="link-tile mt-4">
                      <div className="link-tile-icon">{<AuthorIcon url={linkUrl} />}</div>
                      <div className="link-tile-text">
                        <div className="link-tile-title">{entry.name}</div>
                        <div className="link-tile-subtitle">{new URL(linkUrl).hostname}</div>
                      </div>
                      <span className="link-tile-arrow">→</span>
                    </a>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
