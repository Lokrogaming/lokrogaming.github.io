import { useTranslation } from '@/lib';

export function Branding() {
  const { t } = useTranslation();

  const colors = [
    { name: 'Akzent', hex: '#7fe3b4', label: 'de' },
    { name: 'Akzent (dunkel)', hex: '#0f9e64', label: 'light' },
    { name: 'Gold', hex: '#d9b876', label: 'de' },
    { name: 'Warnung', hex: '#e3b97f', label: 'de' },
    { name: 'Hintergrund', hex: '#0a0a0b', label: 'de' },
    { name: 'Vordergrund', hex: '#f2f2f0', label: 'de' },
  ];

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-4xl mx-auto px-6">
        <div className="reveal mb-12 in">
          <div className="eyebrow mb-4">{t('brandingEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">{t('brandingTitlePage')}</h2>
          <p className="mt-6 muted leading-relaxed max-w-2xl">{t('brandingDesc')}</p>
        </div>

        <div className="card chamfer p-8 reveal in mb-12">
          <div className="font-mono text-xs dim mb-4">FARBPALETTE</div>
          <div className="grid sm:grid-cols-3 gap-4">
            {colors.map((c) => (
              <div key={c.name} className="card chamfer-sm p-5">
                <div className="swatch-face" style={{ background: c.hex }} />
                <div className="mt-3 font-mono text-xs">{c.name}</div>
                <div className="font-mono text-xs dim mt-1">{c.hex}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="card chamfer p-8 reveal in">
            <div className="font-mono text-xs dim mb-4">TYPOGRAFIE</div>
            <h3 className="font-display font-semibold text-xl mb-3">Space Grotesk</h3>
            <p className="text-sm muted mb-4">Überschriften und Display-Texte.</p>
            <div className="typo-sample">
              <p className="font-display font-semibold text-lg">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="font-display text-sm muted">abcdefghijklmnopqrstuvwxyz 0123456789</p>
            </div>
          </div>
          <div className="card chamfer p-8 reveal reveal-d1">
            <div className="font-mono text-xs dim mb-4">MONOSPACE</div>
            <h3 className="font-display font-semibold text-xl mb-3">JetBrains Mono</h3>
            <p className="text-sm muted mb-4">UI-Elemente, Codes, technische Details.</p>
            <div className="typo-sample font-mono">
              <p className="text-sm">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="text-xs muted">abcdefghijklmnopqrstuvwxyz 0123456789</p>
            </div>
          </div>
        </div>

        <div className="card chamfer p-8 reveal reveal-d2 mt-12">
          <div className="font-mono text-xs dim mb-4">FORMENSPRACHE</div>
          <h3 className="font-display font-semibold text-xl mb-4">Chamfer (Gehrung)</h3>
          <p className="text-sm muted mb-6">LOKRO verwendet konsequent abgerundete, leicht abgeschrägte Ecken für Karten, Buttons und Eingabefelder.</p>
          <div className="grid grid-cols-3 gap-4">
            {[ 'chamfer', 'chamfer-sm', 'chamfer-lg' ].map((cls) => (
              <div key={cls} className={`card chamfer p-4 ${cls}`} style={{ background: 'var(--bg-elev-2)' }}>
                <div className="font-mono text-xs dim">{cls}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
