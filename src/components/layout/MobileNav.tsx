import * as React from 'react';
import { useTranslation } from '@/lib';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const labels = {
    open: t('navCommunity'),
    close: 'Schließen',
    drawer: 'Navigation',
  };

  return (
    <>
      <button
        type="button"
        id="mobile-nav-toggle"
        className="mobile-nav-toggle"
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true"></span>
      </button>
      <button
        type="button"
        className="mobile-nav-backdrop"
        aria-label={labels.close}
        tabIndex={-1}
        hidden={!open}
        onClick={() => setOpen(false)}
      />
      <nav
        id="mobile-nav-drawer"
        className={cn('mobile-nav-drawer', open ? 'is-open' : '')}
        aria-label={labels.drawer}
        aria-hidden={!open}
      >
        <a href="/" className={cn('mobile-nav-item', open && 'active')}>
          <HomeIcon size={20} />
          <span className="bottom-nav-label">Home</span>
        </a>
        <a href="/join" className="mobile-nav-item">
          <UserIcon size={20} />
          <span className="bottom-nav-label">Join</span>
        </a>
        <a href="/hall-of-fame" className="mobile-nav-item">
          <TrophyIcon size={20} />
          <span className="bottom-nav-label">Fame</span>
        </a>
      </nav>
    </>
  );
}

function HomeIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size}>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6 9.5V20h5v-5h2v5h5V9.5" />
    </svg>
  );
}
function UserIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
    </svg>
  );
}
function TrophyIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size}>
      <path d="M12 3l2.6 5.9 6.4 .6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6z" />
    </svg>
  );
}
