import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib';
import { getPocketBase } from '@/lib/pocketbase';

interface ChangelogEntry {
  id: string;
  slug: string;
  title: string;
  version?: string;
  date: string;
  summary: string;
  content_html?: string;
  tags: string[];
  url?: string;
}

export function Changelog() {
  const { t } = useTranslation();
  const pb = getPocketBase();

  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const records = await pb.collection('changelog').getFullList<ChangelogEntry>({
          sort: '-date',
        });
        if (mounted && records.length > 0) setEntries(records as unknown as ChangelogEntry[]);
      } catch {
        // Sammlung ggf. nicht vorhanden -> bleibt leer.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pb]);

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-3xl mx-auto px-6">
        <div className="reveal mb-10 in">
          <div className="eyebrow mb-4">{t('changelogEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">{t('changelogTitlePage')}</h2>
          <p className="mt-5 muted max-w-2xl leading-relaxed">{t('changelogIntro')}</p>
        </div>

        {loading ? (
          <p className="muted text-center py-12">{t('changelogIntro')}</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 reveal in">
            <p className="muted text-lg">{t('noChangelog')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="card chamfer p-7 reveal accordion-item">
                <button className="accordion-btn" aria-expanded="false">
                  <span className="font-display font-semibold text-sm sm:text-base">
                    {entry.title}
                  </span>
                  <span className="accordion-icon chamfer-sm">+</span>
                </button>
                <div className="accordion-panel">
                  <div className="accordion-panel-inner">
                    <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs muted">
                      {entry.version && <span className="chip chamfer-sm">v{entry.version}</span>}
                      <span className="chip chamfer-sm">{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {entry.tags.map((tag) => (
                        <span key={tag} className="chip chamfer-sm">{tag}</span>
                      ))}
                    </div>
                    <p className="text-sm muted leading-relaxed mb-4">{entry.summary}</p>
                    {entry.url && (
                      <a href={entry.url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:opacity-70 transition inline-flex items-center gap-1">
                        {t('readMore')} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
