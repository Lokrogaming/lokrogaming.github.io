import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib';
import { useParams, Link } from 'react-router-dom';
import { getPocketBase } from '@/lib/pocketbase';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

interface Application {
  id: string;
  title: string;
  team: string;
  status: 'open' | 'closed';
  summary: string;
  requirements: string[];
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  required: boolean;
}

// Lokales Fallback, falls PocketBase (noch) keine Sammlungen hat.
const FALLBACK_APPS: Application[] = [
  {
    id: 'bot-dev',
    title: 'Discord-Bot Developer',
    team: 'LokroBot',
    status: 'open',
    summary: 'Du entwickelst mit uns an LokroBot / lokro-content-bot: Content-Builder-Commands, Embeds und mehr.',
    requirements: ['Erfahrung mit Node.js und discord.js', 'Sauberer, wartbarer Code', 'Eigeninitiative bei kleinen Features'],
    questions: [
      { id: 'erfahrung_nodejs', label: 'Wie viel Erfahrung hast du mit Node.js?', type: 'select', options: ['Anfänger', 'Fortgeschritten', 'Sehr erfahren'], required: true },
      { id: 'github', label: 'Link zu deinem GitHub-Profil (optional)', type: 'text', required: false },
      { id: 'motivation', label: 'Warum möchtest du bei LOKRO mitmachen?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'infra-helfer',
    title: 'Infrastruktur & Hosting Helfer',
    team: 'Infrastructure',
    status: 'open',
    summary: 'Unterstütze uns beim Betrieb von Servern, Deployments und der CDN-Infrastruktur rund um lokro.dev.',
    requirements: ['Grundkenntnisse Linux / CLI', 'Interesse an Deployment & Hosting', 'Zuverlässigkeit bei laufenden Diensten'],
    questions: [
      { id: 'erfahrung_linux', label: 'Wie viel Erfahrung hast du mit Linux / CLI?', type: 'select', options: ['Anfänger', 'Fortgeschritten', 'Sehr erfahren'], required: true },
      { id: 'verfuegbarkeit', label: 'Wie viele Stunden pro Woche kannst du etwa einbringen?', type: 'text', required: true },
      { id: 'motivation', label: 'Warum möchtest du bei LOKRO mitmachen?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'design-helfer',
    title: 'UI / Grafik Helfer',
    team: 'Design',
    status: 'closed',
    summary: 'Unterstützung bei UI-Design und grafischen Assets für verschiedene LOKRO-Projekte.',
    requirements: ['Erfahrung mit Figma o.ä.', 'Gespür für klares, reduziertes Design'],
    questions: [{ id: 'portfolio', label: 'Link zu deinem Portfolio', type: 'text', required: true }],
  },
];

export function Join() {
  const { t, lang } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = (params.lang as Lang) ?? lang;
  const pb = getPocketBase();

  const [apps, setApps] = useState<Application[]>(FALLBACK_APPS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [appId, setAppId] = useState<string>('');

  // Positionen aus PocketBase laden (Sammlung: applications), sonst Fallback.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const records = await pb.collection('applications').getFullList<Application>({
          filter: 'status = "open"',
          sort: '-created',
        });
        if (mounted && records.length > 0) setApps(records as unknown as Application[]);
      } catch {
        // PocketBase nicht erreichbar oder Sammlung fehlt -> Fallback bleibt.
      }
    })();
    return () => { mounted = false; };
  }, [pb]);

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent, application: Application) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Pflichtfelder prüfen
    for (const q of application.questions) {
      if (q.required && !formData[q.id]?.trim()) {
        setError(t('reqField'));
        setSubmitting(false);
        return;
      }
    }

    try {
      await pb.collection('applications_submissions').create({
        application: application.id,
        language: currentLang,
        data: formData,
        created: new Date().toISOString(),
      });
      setSubmitted(true);
      setFormData({});
    } catch {
      setError(t('toastErrorDesc'));
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-24 border-t border-c">
        <div className="max-w-2xl mx-auto px-6 text-center reveal in">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-accent" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">{t('btnSuccess')}</h2>
          <p className="mt-4 muted leading-relaxed">{t('toastSuccessDesc')}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/${currentLang}/`} className="btn-primary chamfer px-6 py-3.5 text-sm">
              {t('navHome')}
            </Link>
            <Link to={`/${currentLang}/join`} className="btn-ghost chamfer px-6 py-3.5 text-sm">
              {t('navJoin')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-6xl mx-auto px-6">
        <div className="reveal mb-12 in">
          <div className="eyebrow mb-4">{t('joinEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">{t('joinTitlePage')}</h2>
          <p className="mt-6 muted leading-relaxed max-w-2xl">{t('joinIntro')}</p>
        </div>

        {error && (
          <div className="mb-8 notice-box chamfer-sm p-4 reveal in" role="alert">
            <AlertCircle className="w-5 h-5 mr-2 muted" aria-hidden="true" />
            <span className="font-mono text-sm">{error}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" id="project-grid">
          {apps.map((app) => {
            const open = app.status === 'open';
            return (
              <div
                key={app.id}
                className={cn('card chamfer p-7 reveal reveal-d1 in', !open && 'opacity-50')}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`dot-live ${open ? '' : 'opacity-40'}`} />
                  <span className="font-mono text-xs dim">{open ? t('statusOpen') : t('statusClosed')}</span>
                </div>
                <h3 className="font-display text-xl font-semibold">{app.title}</h3>
                <div className="font-mono text-xs dim mb-3">{app.team}</div>
                <p className="mt-2 text-sm muted leading-relaxed mb-4">{app.summary}</p>
                <ul className="space-y-1 text-sm muted mb-6">
                  {app.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: 'var(--accent)' }}>·</span> {r}
                    </li>
                  ))}
                </ul>
                {open ? (
                  <button
                    onClick={() => setAppId(app.id)}
                    className="w-full btn-ghost chamfer-sm px-5 py-2.5 text-sm text-left font-mono hover:bg-accent-dim transition"
                  >
                    {t('btnApply')} <span style={{ marginLeft: 'auto' }}>→</span>
                  </button>
                ) : (
                  <button disabled className="w-full btn-ghost chamfer-sm px-5 py-2.5 text-sm text-left font-mono opacity-40">
                    {t('statusClosed')}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {appId && (
          <div className="mt-10 card chamfer p-8 reveal in" id="application-form">
            <button
              onClick={() => setAppId('')}
              className="mb-6 font-mono text-xs dim hover:opacity-70 transition inline-flex items-center gap-1"
            >
              ← {t('navJoin')}
            </button>
            <h3 className="font-display text-2xl font-semibold mb-6">
              {apps.find((a) => a.id === appId)?.title ?? ''}
            </h3>
            <form onSubmit={(e) => handleSubmit(e, apps.find((a) => a.id === appId)!)} noValidate>
              {apps.find((a) => a.id === appId)?.questions.map((q) => (
                <div key={q.id} className="mb-5">
                  <label className="field-label block mb-1.5">
                    {q.label} {q.required ? <span style={{ color: 'var(--accent)' }}>*</span> : ''}
                  </label>
                  {q.type === 'select' ? (
                    <select
                      className="select-field input-field"
                      value={formData[q.id] ?? ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    >
                      <option value="">{t('statusOpen') === 'Offen' ? 'Wählen' : 'Select'}</option>
                      {q.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : q.type === 'textarea' ? (
                    <textarea
                      className="textarea-field input-field"
                      value={formData[q.id] ?? ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <input
                      className="input-field"
                      type="text"
                      value={formData[q.id] ?? ''}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary chamfer px-6 py-3.5 text-sm font-mono disabled:opacity-50"
              >
                {submitting ? t('btnSubmitting') : t('btnSubmit')}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
