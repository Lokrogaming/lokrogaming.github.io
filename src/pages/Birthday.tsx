import { useTranslation } from '@/lib';
import { Cake } from 'lucide-react';
import { DotLive } from '@/components/ui/DotLive';

export function Birthday() {
  const { t } = useTranslation();

  return (
    <section className="py-24 border-t border-c relative overflow-hidden">
      <div className="absolute inset-0 bg-grid hero-fade opacity-60" />
      <div className="relative max-w-2xl mx-auto px-6 text-center reveal in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-accent-dim text-accent font-black text-2xl">
            <Cake size={32} />
          </div>
        </div>
        <div className="eyebrow mb-4">{t('birthdayEyebrow')}</div>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">{t('birthdayTitle')}</h2>
        <p className="mt-6 max-w-xl mx-auto text-lg muted leading-relaxed">
          {t('birthdayDesc')}
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button className="btn-primary chamfer px-7 py-3.5 text-sm flex items-center gap-2">
            <DotLive kind="gold" /> Feiern
          </button>
        </div>
      </div>
    </section>
  );
}
