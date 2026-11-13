import * as React from 'react';

interface OrbProps {
  kind: 'accent' | 'soft';
  style?: React.CSSProperties;
  depth?: number;
}

export function Orb({ kind, style, depth }: OrbProps) {
  return (
    <div
      className={`orb ${kind === 'accent' ? 'orb-accent orb-a' : 'orb-soft orb-b'}`}
      data-parallax={String(depth ?? (kind === 'accent' ? 26 : -20))}
      style={{
        ...style,
        top: style?.top ?? (kind === 'accent' ? '-120px' : '10%'),
        left: style?.left,
        right: style?.right,
      }}
      aria-hidden="true"
    />
  );
}
