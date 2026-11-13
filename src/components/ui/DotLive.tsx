export function DotLive({ kind }: { kind?: 'live' | 'gold' } = {}) {
  const color = kind === 'gold' ? 'var(--gold)' : 'var(--accent)';
  const dim = kind === 'gold' ? 'var(--gold-dim)' : 'var(--accent-dim)';
  return (
    <span
      className="dot-live inline-block"
      style={{ background: color, boxShadow: `0 0 0 3px ${dim}` }}
      aria-hidden="true"
    />
  );
}
