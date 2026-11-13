import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib';
import { Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SiteSettings {
  seasonalTheme: boolean;
  weatherEgg: boolean;
  reducedMotion: boolean;
  themeId: string;
}

interface CustomTheme {
  id: string;
  name: string;
  colors: Record<string, string>;
  headerShadow?: boolean;
  author?: { name: string; platform: string; username: string } | null;
}

const THEME_VARS = [
  '--bg', '--bg-elev', '--bg-elev-2', '--fg', '--fg-muted', '--fg-dim',
  '--border', '--border-strong', '--grid-line', '--grid-line-strong',
  '--accent', '--cursor-accent', '--accent-dim', '--warn', '--warn-dim', '--gold', '--gold-dim',
];

const ORIGINAL_COLORS: Record<string, string> = {
  '--bg': '#0a0a0b', '--bg-elev': '#111113', '--bg-elev-2': '#17171a',
  '--fg': '#f2f2f0', '--fg-muted': '#9a9a9e', '--fg-dim': '#626266',
  '--border': '#1a1a1d', '--border-strong': '#2b2b30',
  '--grid-line': '#141416', '--grid-line-strong': '#1e1e22',
  '--accent': '#7fe3b4', '--cursor-accent': '#0f9e64', '--accent-dim': '#16382a',
  '--warn': '#e3b97f', '--warn-dim': '#3a2c17',
  '--gold': '#d9b876', '--gold-dim': '#38300f',
};

const LUMINANCE_LABELS: Record<string, string> = {
  '--bg': 'Hintergrund',
  '--bg-elev': 'Hintergrund (erhöht)',
  '--bg-elev-2': 'Hintergrund (erhöht 2)',
  '--fg': 'Vordergrund',
  '--fg-muted': 'Text (gedämpft)',
  '--fg-dim': 'Text (dunkel)',
  '--border': 'Rahmen',
  '--border-strong': 'Rahmen (stark)',
  '--grid-line': 'Rasterlinie',
  '--grid-line-strong': 'Rasterlinie (stark)',
  '--accent': 'Akzent',
  '--cursor-accent': 'Cursor-Akzent',
  '--accent-dim': 'Akzent (gedämpft)',
  '--warn': 'Warnung',
  '--warn-dim': 'Warnung (gedämpft)',
  '--gold': 'Gold',
  '--gold-dim': 'Gold (gedämpft)',
};

const MODES = ['system', 'light', 'dark'] as const;

export function Settings() {
  const { t } = useTranslation();
  const root = document.documentElement;

  const [settings, setSettings] = useState<SiteSettings>({
    seasonalTheme: true,
    weatherEgg: false,
    reducedMotion: false,
    themeId: 'original',
  });
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [editing, setEditing] = useState<CustomTheme | null>(null);
  const [themeName, setThemeName] = useState('');
  const [newColors, setNewColors] = useState<Record<string, string>>({ ...ORIGINAL_COLORS });
  const [headerShadow, setHeaderShadow] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem('lokro-settings');
      if (s) setSettings(JSON.parse(s));
      const th = localStorage.getItem('lokro-themes');
      if (th) setCustomThemes(JSON.parse(th));
    } catch {}
    applyStored();
  }, []);

  const applyStored = () => {
    if (settings.themeId === 'original') {
      clearCustom(root);
    } else {
      const found = customThemes.find((t) => t.id === settings.themeId);
      if (found) applyCustom(root, found);
    }
    root.setAttribute('data-motion', settings.reducedMotion ? 'reduced' : '');
    if (!settings.reducedMotion) root.removeAttribute('data-motion');
    if (settings.seasonalTheme) root.setAttribute('data-season', 'spring');
    else root.removeAttribute('data-season');
  };

  const clearCustom = (r: HTMLElement) => {
    THEME_VARS.forEach((k) => r.style.removeProperty(k));
    r.removeAttribute('data-hshadow');
  };
  const applyCustom = (r: HTMLElement, theme: CustomTheme) => {
    THEME_VARS.forEach((k) => {
      if (theme.colors[k]) r.style.setProperty(k, theme.colors[k]);
    });
    if (theme.headerShadow) r.setAttribute('data-hshadow', '1');
    else r.removeAttribute('data-hshadow');
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('lokro-settings', JSON.stringify(settings));
      setToast({ type: 'success', message: t('settingsTitle') });
    } catch {
      setToast({ type: 'error', message: t('toastErrorDesc') });
    }
    applyStored();
    setTimeout(() => setToast(null), 2000);
  };

  const saveCustomTheme = () => {
    if (!themeName.trim()) return;
    const theme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: themeName.trim(),
      colors: { ...newColors },
      headerShadow,
    };
    setCustomThemes((prev) => [...prev, theme]);
    try {
      localStorage.setItem('lokro-themes', JSON.stringify([...customThemes, theme]));
      setSettings({ ...settings, themeId: theme.id });
      localStorage.setItem('lokro-settings', JSON.stringify({ ...settings, themeId: theme.id }));
      setEditing(null);
      setThemeName('');
      setNewColors({ ...ORIGINAL_COLORS });
      setHeaderShadow(false);
      setToast({ type: 'success', message: 'Theme gespeichert' });
    } catch {
      setToast({ type: 'error', message: t('toastErrorDesc') });
    }
    applyStored();
    setTimeout(() => setToast(null), 2000);
  };

  const deleteTheme = (id: string) => {
    setCustomThemes((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try { localStorage.setItem('lokro-themes', JSON.stringify(next)); } catch {}
      if (settings.themeId === id) {
        setSettings({ ...settings, themeId: 'original' });
        try { localStorage.setItem('lokro-settings', JSON.stringify({ ...settings, themeId: 'original' })); } catch {}
        clearCustom(root);
      }
      return next;
    });
  };

  return (
    <section className="py-24 border-t border-c">
      <div className="max-w-4xl mx-auto px-6">
        <div className="reveal mb-12 in">
          <div className="eyebrow mb-4">{t('settingsEyebrow')}</div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">{t('settingsTitlePage')}</h2>
          <p className="mt-6 muted leading-relaxed max-w-2xl">{t('settingsIntro')}</p>
        </div>

        {toast && (
          <div className="mb-6 notice-box chamfer-sm p-4 reveal in flex items-center gap-3" role="status">
            {toast.type === 'success' ? (
              <CheckIcon className="w-5 h-5 text-accent" />
            ) : (
              <AlertIcon className="w-5 h-5 text-warn" />
            )}
            <span className="font-mono text-sm">{toast.message}</span>
          </div>
        )}

        {/* Farbschema */}
        <div className="card chamfer p-8 reveal in mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-xs dim mb-1">{t('themeSection')}</div>
              <h3 className="font-display font-semibold">{t('themeSection')}</h3>
            </div>
            <div className="flex gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setSettings({ ...settings, themeId: mode === 'system' ? 'original' : settings.themeId });
                    try { localStorage.setItem('lokro-theme', mode); } catch {}
                  }}
                  className={cn('font-mono text-xs px-3 py-1.5 chamfer-sm border', settings.themeId === (mode === 'system' ? 'original' : settings.themeId) ? 'border-accent bg-accent text-[#07110a]' : 'border-border text-fg-muted bg-transparent')}
                >
                  {mode === 'system' ? t('themeSystem') : mode === 'light' ? t('themeLight') : t('themeDark')}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="switch">
              <input
                id="seasonal"
                type="checkbox"
                checked={settings.seasonalTheme}
                onChange={(e) => setSettings({ ...settings, seasonalTheme: e.target.checked })}
              />
              <span className="track"></span>
              <label htmlFor="seasonal" className="text-sm">{t('seasonalSection')}</label>
              <p className="font-mono text-xs muted mt-1">{t('seasonalDesc')}</p>
            </div>
            <div className="switch">
              <input
                id="weather"
                type="checkbox"
                checked={settings.weatherEgg}
                onChange={(e) => setSettings({ ...settings, weatherEgg: e.target.checked })}
              />
              <span className="track"></span>
              <label htmlFor="weather" className="text-sm">{t('weatherSection')}</label>
              <p className="font-mono text-xs muted mt-1">{t('weatherDesc')}</p>
            </div>
            <div className="switch">
              <input
                id="motion"
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })}
              />
              <span className="track"></span>
              <label htmlFor="motion" className="text-sm">{t('motionSection')}</label>
              <p className="font-mono text-xs muted mt-1">{t('motionDesc')}</p>
            </div>
          </div>
          <button onClick={saveSettings} className="mt-6 btn-primary chamfer px-6 py-3 text-sm font-mono">
            {t('navSettings')}
          </button>
        </div>

        {/* Benutzerdefinierte Themes */}
        <div className="card chamfer p-8 reveal in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-xs dim mb-1">{t('customThemeSection')}</div>
              <h3 className="font-display font-semibold">{t('customThemeSection')}</h3>
            </div>
            {editing ? (
              <button onClick={() => setEditing(null)} className="font-mono text-xs hover:opacity-70 transition">
                Abbrechen <X size={16} className="ml-1" />
              </button>
            ) : (
              <button onClick={() => {
                setEditing({ id: '', name: '', colors: { ...ORIGINAL_COLORS } });
                setThemeName('');
                setNewColors({ ...ORIGINAL_COLORS });
                setHeaderShadow(false);
              }} className="font-mono text-xs hover:opacity-70 transition flex items-center gap-1">
                <Plus size={16} /> {t('customThemeDesc').split('·')[0] || 'Neues Theme'}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              <div>
                <label className="field-label block mb-2">Theme-Name</label>
                <input
                  className="input-field w-full"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="z. B. Mein Dunkles Theme"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {THEME_VARS.map((k) => (
                  <div key={k} className="col-span-2 sm:col-span-1">
                    <label className="field-label block mb-1">{LUMINANCE_LABELS[k] ?? k}</label>
                    <input
                      type="color"
                      className="color-field w-full h-9"
                      value={newColors[k] ?? '#000000'}
                      onChange={(e) => setNewColors({ ...newColors, [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="switch">
                <input
                  id="shadow"
                  type="checkbox"
                  checked={headerShadow}
                  onChange={(e) => setHeaderShadow(e.target.checked)}
                />
                <span className="track"></span>
                <label htmlFor="shadow" className="text-sm">Header-Schatten</label>
              </div>
              <div className="flex gap-3">
                <button onClick={saveCustomTheme} className="flex-1 btn-primary chamfer px-6 py-3 text-sm font-mono">
                  Speichern
                </button>
                <button onClick={() => setEditing(null)} className="btn-ghost chamfer px-6 py-3 text-sm font-mono">
                  Verwerfen
                </button>
              </div>
            </div>
          ) : (
            <>
              {customThemes.length === 0 ? (
                <p className="muted text-center py-12">Noch keine benutzerdefinierten Themes.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {customThemes.map((theme) => (
                    <div key={theme.id} className="card chamfer p-6 reveal in">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-display font-semibold">{theme.name}</h4>
                        {settings.themeId === theme.id && (
                          <span className="font-mono text-xs px-2 py-0.5 chamfer-sm border-accent text-accent bg-accent-dim">Aktiv</span>
                        )}
                      </div>
                      <div className="flex gap-2 mb-4">
                        {THEME_VARS.slice(0, 4).map((k) => (
                          <span key={k} className="w-3 h-3 rounded-full" style={{ background: theme.colors[k] ?? '#000' }} />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(theme);
                            setThemeName(theme.name);
                            setNewColors({ ...theme.colors });
                            setHeaderShadow(!!theme.headerShadow);
                          }}
                          className="flex-1 btn-ghost chamfer-sm px-4 py-2 text-xs font-mono hover:bg-accent-dim transition"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          className="btn-ghost chamfer-sm px-4 py-2 text-xs font-mono text-fg-dim hover:text-warn transition"
                        >
                          <Trash2 size={16} className="mr-1" /> Löschen
                        </button>
                        {settings.themeId !== theme.id && (
                          <button
                            onClick={() => {
                              setSettings({ ...settings, themeId: theme.id });
                              try { localStorage.setItem('lokro-settings', JSON.stringify({ ...settings, themeId: theme.id })); } catch {}
                              applyCustom(root, theme);
                            }}
                            className="flex-1 btn-primary chamfer-sm px-4 py-2 text-xs font-mono"
                          >
                            Aktivieren
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  );
}
