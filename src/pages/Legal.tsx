import { useTranslation } from '@/lib';
import { FileText } from 'lucide-react';

export function Impressum() {
  const { t } = useTranslation();

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-3xl mx-auto px-6">
        <div className="reveal mb-10 in">
          <div className="eyebrow mb-4">{t('impressumEyebrow')}</div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">{t('impressumTitle')}</h2>
        </div>
        <div className="card chamfer p-8 reveal in prose-like">
          <div className="font-mono text-xs dim mb-4 flex items-center gap-2">
            <FileText size={16} /> Impressum
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">Angaben gemäß § 5 DDG</h3>
          <p className="text-sm muted leading-relaxed mb-4">
            LOKRO — Ein Netzwerk für alle<br />
            Projekt-Netzwerk (non-profit)<br />
            Kontakt: info@lokro.dev
          </p>
          <p className="text-sm muted leading-relaxed">
            Diese Website ist ein 100% non-profit Angebot. Alle Inhalte sind kostenlos zugänglich.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Datenschutz() {
  const { t } = useTranslation();

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-3xl mx-auto px-6">
        <div className="reveal mb-10 in">
          <div className="eyebrow mb-4">{t('datenschutzEyebrow')}</div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">{t('datenschutzTitle')}</h2>
        </div>
        <div className="card chamfer p-8 reveal in prose-like">
          <div className="font-mono text-xs dim mb-4 flex items-center gap-2">
            <FileText size={16} /> Datenschutz
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">Datenschutzerklärung</h3>
          <p className="text-sm muted leading-relaxed mb-4">
            LOKRO sammelt keine personenbezogenen Daten, setzt kein Tracking ein und verwendet keine Cookies zur Nutzeranalyse.
            Spracheinstellungen und Themes werden ausschließlich lokal in deinem Browser (localStorage) gespeichert.
          </p>
          <p className="text-sm muted leading-relaxed">
            Bei der Nutzung von PocketBase (db.lokro.dev) für Bewerbungen gelten die Datenschutzbestimmungen des jeweiligen Providers.
          </p>
        </div>
      </div>
    </section>
  );
}
