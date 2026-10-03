import type { ReactNode } from 'react';

import type { IconKey } from '../data/steps';

/** Wspólne cegiełki UI symulacji: komórki danych, chipy, etykiety, ikony. */

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs uppercase tracking-upper text-text-dim">{children}</span>
  );
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'text' }) {
  const tones = {
    neutral: 'border-border text-text-muted',
    accent: 'border-accent/50 bg-accent/10 text-accent',
    text: 'border-data-text/40 bg-data-text/5 text-data-text',
  };
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-0.5 font-mono text-xs ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Mała komórka bajtu w hex (SSD/RAM/CPU). tone: niebieski (bajty) lub zielony (tekst). */
export function HexByte({
  value,
  active,
  tone = 'blue',
  size = 'md',
}: {
  value: number;
  active?: boolean;
  tone?: 'blue' | 'green';
  size?: 'md' | 'lg';
}) {
  const hex = value.toString(16).toUpperCase().padStart(2, '0');
  const activeCls =
    tone === 'green'
      ? 'border-data-text bg-data-text/15 text-data-text'
      : 'border-data-bytes bg-data-bytes/15 text-data-bytes';
  const sizeCls = size === 'lg' ? 'h-10 w-12 text-base' : 'h-8 w-9 text-sm';
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded border font-mono transition-colors duration-700 ease-in-out',
        sizeCls,
        active ? activeCls : 'border-border text-text-muted',
      ].join(' ')}
    >
      {hex}
    </span>
  );
}

/** Karta liczby (dec + hex) — niebieska. */
export function NumberCard({ dec, hex }: { dec: number; hex: string }) {
  return (
    <div className="flex h-16 w-full min-w-0 flex-col items-center justify-center rounded-md border border-data-bytes/40 bg-data-bytes/5 px-1">
      <span className="font-mono text-lg text-data-bytes">{dec}</span>
      <span className="font-mono text-xs text-text-dim">{hex}</span>
    </div>
  );
}

/** Karta znaku — zielona. */
export function CharCard({ char }: { char: string }) {
  return (
    <div className="flex h-16 w-full min-w-0 items-center justify-center rounded-md border border-data-text/40 bg-data-text/5 font-heading text-2xl text-data-text">
      {char === ' ' ? '␣' : char}
    </div>
  );
}

/** Karta zapisu binarnego — fioletowa. */
export function BinaryCard({ bits }: { bits: string }) {
  return (
    <div className="flex h-10 w-full min-w-0 items-center justify-center rounded-md border border-data-bits/40 bg-data-bits/5 px-0.5 font-mono text-[10px] leading-none tracking-tight text-data-bits">
      {bits}
    </div>
  );
}

/** Ikona podzespołu (prosta grafika liniowa). */
export function ComponentIcon({ icon, className = 'h-16 w-16' }: { icon: IconKey; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (icon) {
    case 'mouse':
      return (
        <svg {...common}>
          <rect x="16" y="6" width="16" height="36" rx="8" />
          <line x1="24" y1="6" x2="24" y2="22" />
        </svg>
      );
    case 'ssd':
      return (
        <svg {...common}>
          <rect x="8" y="12" width="32" height="24" rx="3" />
          <line x1="14" y1="20" x2="26" y2="20" />
          <line x1="14" y1="26" x2="22" y2="26" />
          <circle cx="33" cy="24" r="2" />
        </svg>
      );
    case 'ram':
      return (
        <svg {...common}>
          <rect x="6" y="16" width="36" height="16" rx="2" />
          <line x1="14" y1="16" x2="14" y2="32" />
          <line x1="24" y1="16" x2="24" y2="32" />
          <line x1="34" y1="16" x2="34" y2="32" />
          <line x1="12" y1="34" x2="12" y2="38" />
          <line x1="36" y1="34" x2="36" y2="38" />
        </svg>
      );
    case 'cpu':
      return (
        <svg {...common}>
          <rect x="12" y="12" width="24" height="24" rx="2" />
          <rect x="19" y="19" width="10" height="10" rx="1" />
          {[18, 24, 30].map((p) => (
            <g key={p}>
              <line x1={p} y1="6" x2={p} y2="12" />
              <line x1={p} y1="36" x2={p} y2="42" />
              <line x1="6" y1={p} x2="12" y2={p} />
              <line x1="36" y1={p} x2="42" y2={p} />
            </g>
          ))}
        </svg>
      );
    case 'gpu':
      return (
        <svg {...common}>
          <rect x="6" y="14" width="34" height="20" rx="2" />
          <circle cx="18" cy="24" r="5" />
          <circle cx="31" cy="24" r="3" />
          <line x1="10" y1="34" x2="10" y2="40" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="6" y="8" width="36" height="24" rx="2" />
          <line x1="24" y1="32" x2="24" y2="38" />
          <line x1="16" y1="40" x2="32" y2="40" />
        </svg>
      );
  }
}
