import { useState } from 'react';
import { useTranslation } from '@/lib';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

interface RoadmapItem {
  id: string;
  status: 'planned' | 'in-progress' | 'done';
  eta?: string | null;
  title: Record<string, string>;
  description: Record<string, string>;
}

const STATUS_LABELS: Record<'planned' | 'in-progress' | 'done', string> = {
  planned: 'Geplant',
  'in-progress': 'In Arbeit',
  done: 'Erledigt',
};

const FALLBACK_ROADMAP: RoadmapItem[] = [
  {
    id: 'themes',
    status: 'in-progress',
    eta: null,
    title: { de: 'Anpassbare Themes', en: 'Customizable themes' },
    description: { de: 'Helle, dunkle und eigene Farbakzente — direkt in den Einstellungen umsetzbar.', en: 'Light, dark and custom color accents — right in the settings.' },
  },
  {
    id: 'legal',
    status: 'done',
    eta: null,
    title: { de: 'Impressum & Datenschutz', en: 'Imprint & privacy' },
    description: { de: 'Impressum nach § 5 DDG und Datenschutzerklärung — live auf jeder Sprachseite.', en: 'Legal notice pursuant to § 5 DDG and privacy policy — live on every language page.' },
  },
  {
    id: 'news',
    status: 'planned',
    eta: null,
    title: { de: 'News-Seite mit Blogposts', en: 'News page with blog posts' },
    description: { de: 'Neuigkeiten aus dem Blog direkt auf lokro.dev.', en: 'Blog news directly on lokro.dev.' },
  },
  {
    id: 'directory',
    status: 'planned',
    eta: null,
    title: { de: 'Projekt-Verzeichnis', en: 'Project directory' },
    description: { de: 'Alle Projekte durchsuchbar an einem Ort.', en: 'All projects, searchable in one place.' },
  },
];

export function Roadmap() {
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = (params.lang as Lang) ?? 'de';

  const [items] = useState<RoadmapItem[]>(FALLBACK_ROADMAP);

  const statusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'planned': return 'var(--fg-dim)';
      case 'in-progress': return 'var(--accent)';
      case 'done': return 'var(--gold)';
    }
  };

  return (
    <section className="py-24 border-t border-c relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="reveal mb-10 in">
          <div className="eyebrow mb-4">{t('roadmapEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">{t('roadmapTitlePage')}</h2>
          <p className="mt-5 muted max-w-2xl leading-relaxed">{t('roadmapIntro')}</p>
        </div>

        <div className="space-y-6">
          {items.map((item) => {
            const title = item.title[currentLang] ?? item.title.de ?? item.title.en ?? '';
            const desc = item.description[currentLang] ?? item.description.de ?? item.description.en ?? '';
            const status = item.status;
            return (
              <div
                key={item.id}
                className={cn('card chamfer p-7 reveal reveal-d1 in', status === 'done' && 'card-feature')}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/*
                  */}
                  <span
                    className="dot-live"
                    style={{
                      background: statusColor(status),
                      boxShadow: `0 0 0 3px ${
                        status === 'done' ? 'var(--gold-dim)' : 'var(--accent-dim)'
                      }`,
                    }}
                  />
                    <span className="font-mono text-xs dim">{STATUS_LABELS[status]}</span>
                  </div>
                  {item.eta && (
                    <span className="font-mono text-xs dim">{t('noEta')}: {item.eta}</span>
                  )}
                </div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm muted leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
