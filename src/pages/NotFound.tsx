import { useTranslation } from '@/lib';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'tr' | 'la';

export function NotFound() {
  const { t } = useTranslation();
  const params = useParams<{ lang?: string }>();
  const currentLang = (params.lang as Lang) ?? 'de';

  return (
    <section className="py-24 border-t border-c relative overflow-hidden">
      <div className="absolute inset-0 bg-grid hero-fade opacity-40" />
      <div className="relative max-w-xl mx-auto px-6 text-center reveal in">
        <div className="flex justify-center mb-8">
          <AlertTriangle className="w-16 h-16 text-warn dim" aria-hidden="true" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold">{t('notFoundTitle')}</h2>
        <p className="mt-4 max-w-md mx-auto text-lg muted leading-relaxed">{t('notFoundDesc')}</p>
        <div className="mt-10">
          <Link to={`/${currentLang}/`} className="btn-primary chamfer px-8 py-3.5 text-sm">
            {t('btnBackHome')}
          </Link>
        </div>
      </div>
    </section>
  );
}
