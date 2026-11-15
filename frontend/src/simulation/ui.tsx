import type { ReactNode } from 'react';

/** Wspólne cegiełki UI symulacji: komórki danych, chipy, etykiety, ikony. */

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'text' }) {
  const tones = {
    neutral: 'border-border text-text-muted',
    accent: 'border-accent-ink/40 bg-accent text-accent-ink',
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
