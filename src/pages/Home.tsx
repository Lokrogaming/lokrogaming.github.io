import { useTranslation } from '@/lib';
import { Link } from 'react-router-dom';
import { DotLive } from '@/components/ui/DotLive';
import { Orb } from '@/components/ui/Orb';

export function Home() {
  const { t } = useTranslation();

  const stats = [
    { num: '100+', suffix: '+', label: t('statProjects') },
    { num: '1.000+', suffix: '+', label: t('statUsers') },
    { num: '100%', suffix: '%', label: t('statFree') },
    { num: '0%', suffix: '%', label: t('statProfit'), accent: true },
  ];

  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid hero-fade" />
      <Orb kind="accent" depth={26} style={{ top: '-120px', left: '-120px' }} />
      <Orb kind="soft" depth={-20} style={{ top: '10%', right: '-180px' }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-2 font-mono text-xs tracking-widest muted mb-8 reveal in">
          <DotLive />
          {t('heroEyebrow')}
        </div>
        <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-4xl reveal in">
          Das Internet gehört<span className="relative"> allen<span style={{ color: 'var(--accent)' }}>. </span></span>
        </h1>
        <p className="mt-8 max-w-xl text-lg muted leading-relaxed reveal reveal-d1">
          {t('heroDesc')}
        </p>
        <div className="mt-6 flex flex-wrap gap-2 reveal reveal-d2">
          <span className="chip chamfer-sm">{t('chipProjects')}</span>
          <span className="chip chamfer-sm">{t('chipFree')}</span>
          <span className="chip chamfer-sm">{t('chipCommunity')}</span>
        </div>
        <div className="mt-10 flex flex-wrap gap-4 reveal reveal-d3">
          <Link to={`#projekte`} className="btn-ghost chamfer px-6 py-3.5 text-sm">
            {t('btnDiscover')}
          </Link>
          <Link to="./join" className="btn-ghost chamfer px-6 py-3.5 text-sm">
            {t('btnJoin')}
          </Link>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 mt-16 reveal in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px card chamfer-lg overflow-hidden" style={{ background: 'var(--border)' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-elev)' }} className="p-6 sm:p-8">
              <div className="font-display text-3xl sm:text-4xl font-semibold stat-num reveal reveal-d1" style={s.accent ? { color: 'var(--accent)' } : {}}>
                <span data-count={s.num.replace(/\D/g, '')} data-suffix={s.suffix}>
                  {s.num}
                </span>
              </div>
              <div className="font-mono text-xs muted mt-2 tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs dim mt-4 leading-relaxed">{t('statNote')}</p>
      </div>

      {/* LOKRO OS */}
      <div className="relative max-w-6xl mx-auto px-6 mt-10 reveal in">
        <div className="card card-highlight chamfer-lg p-7 sm:p-9">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="step-num chamfer-sm font-black" style={{ width: '44px', height: '44px', fontSize: '1.05rem' }}>
                  L
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
                    <DotLive kind="gold" />
                    {t('osAlpha')}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">{t('osTitle')}</h2>
                </div>
              </div>
              <p className="muted leading-relaxed">{t('osDesc')}</p>
              <ul className="mt-6 space-y-2 text-sm muted">
                <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>·</span>Eigenständiges x86_64-System mit Kernel, Firmware, GRUB und Calamares</li>
                <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>·</span>Pacman für das System, Flatpak und Discover für die Apps</li>
                <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>·</span>Quellcode, Build-Metadaten und Prüfsummen offen auf GitHub</li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="tech-chip">Arch</span>
                <span className="tech-chip">Plasma 6</span>
                <span className="tech-chip">Flatpak</span>
                <span className="tech-chip">Hyprland</span>
                <span className="tech-chip">GPL-3.0</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://os.lokro.dev" className="btn-primary chamfer px-6 py-3.5 text-sm">
                  {t('osView')}
                </a>
                <a href="https://os.lokro.dev/#download" className="btn-ghost chamfer px-6 py-3.5 text-sm">
                  {t('osIso')}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { base: 'BASE', val: t('osArch') },
                { base: 'DESKTOP', val: t('osPlasma') },
                { base: 'BUILD', val: t('osAlpha23') },
                { base: t('osIsoSize'), val: t('osIsoValue') },
              ].map((s, i) => (
                <div key={i} className="chamfer-sm p-4" style={{ background: 'var(--bg-elev-2)', border: '1px solid var(--border)' }}>
                  <div className="font-mono text-xs dim">{s.base}</div>
                  <div className="font-display text-sm font-semibold mt-1.5">{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
