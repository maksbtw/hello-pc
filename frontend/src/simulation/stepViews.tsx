import type { ReactNode } from 'react';

import type {
  MouseStep,
  SsdStep,
  RamStep,
  CpuDecodeStep,
  TextEncodeStep,
  RasterStep,
  DisplayStep,
} from '../types/api';
import { stepMeta, type StepMeta } from '../data/steps';
import { useAppStore } from '../store/useAppStore';
import { BinaryCard, CharCard, Chip, FieldLabel, HexByte, NumberCard } from './ui';

/** Dedykowane widoki kroków symulacji (wg template'u z Figmy).
 *  Wspólny układ: grafika1 (lewa) + tekst1 (prawa) · duża grafika (środek) · tekst2 (dół, lewa). */

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
const bin8 = (n: number) => (n & 0xff).toString(2).padStart(8, '0');
const addr8 = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(8, '0');
const printable = (b: number) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : null);
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function StepLayout({
  graphic,
  meta,
  children,
}: {
  graphic: ReactNode;
  meta: StepMeta;
  children: ReactNode;
}) {
  const stepNo = stepMeta.findIndex((m) => m.id === meta.id) + 1;

  return (
    <div className="relative flex h-full flex-col">
      {/* numer kroku rzymski (prawy górny róg) */}
      <span
        className="absolute right-0 top-0 text-5xl leading-none text-accent/60"
        style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif", serif' }}
      >
        {ROMAN[stepNo - 1] ?? stepNo}
      </span>

      {/* 1. tekst (góra, lewa) */}
      <p className="pr-16 text-left font-ui text-base text-text-bright">{meta.descTop}</p>

      {/* 2. grafika 1 (pod tekstem, środek) — równy odstęp góra/dół */}
      <div className="flex justify-center py-10">
        <div className="shrink-0">{graphic}</div>
      </div>

      {/* 3. duża grafika (środek) */}
      <div className="flex flex-1 items-center justify-center pb-10">{children}</div>

      {/* 4. tekst (dół, prawa) */}
      <p className="mt-6 whitespace-pre-line text-right font-ui text-base text-text-bright">
        {meta.descBottom}
      </p>
    </div>
  );
}

function ArrowRight() {
  return <span className="text-xl text-accent">→</span>;
}

function ArrowDown({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-text-dim">
      <svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent/70">
        <line x1="8" y1="2" x2="8" y2="19" strokeLinecap="round" />
        <path d="M3 14 L8 20 L13 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span className="font-mono text-xs">{label}</span>}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <path d="M4 2 h12 l6 6 v20 H4 Z" strokeLinejoin="round" />
      <path d="M16 2 v6 h6" strokeLinejoin="round" />
    </svg>
  );
}

function BlocksIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <rect x="3" y="4" width="20" height="6" rx="1.5" />
      <rect x="3" y="12" width="20" height="6" rx="1.5" />
      <rect x="3" y="20" width="20" height="6" rx="1.5" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="15" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="23" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BytesIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="text-text-soft">
      <text x="2" y="13" fontFamily="monospace" fontSize="9" fill="currentColor">01</text>
      <text x="14" y="13" fontFamily="monospace" fontSize="9" fill="currentColor">10</text>
      <text x="2" y="25" fontFamily="monospace" fontSize="9" fill="currentColor">11</text>
      <text x="14" y="25" fontFamily="monospace" fontSize="9" fill="currentColor">00</text>
    </svg>
  );
}

/** Mała karta kroku w pasku „co się dzieje" (ten sam styl w całej symulacji). */
function FlowCard({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-bg2 px-4 py-3">
      {icon}
      <div>
        <div className="font-mono text-sm text-text">{title}</div>
        <div className="font-mono text-xs text-text-dim">{subtitle}</div>
      </div>
    </div>
  );
}

/* 1 · Mysz (krok usunięty z UI — zostawione dla kompletności unii Step) */
export function MouseStepView({ step }: { step: MouseStep }) {
  return (
    <div className="flex flex-wrap gap-4">
      {step.bytes.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <span className="font-ui text-xs text-text-dim">{step.labels[i] ?? `bajt ${i}`}</span>
          <NumberCard dec={b} hex={`0x${hex2(b)}`} />
          <BinaryCard bits={bin8(b)} />
        </div>
      ))}
    </div>
  );
}

/* 2 · SSD — słowo wielkimi literami, z każdej litery strzałka do jej bajtów */
export function SsdStepView({ step, meta }: { step: SsdStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text);
  const chars = [...(text || 'Hello')];
  const enc = new TextEncoder();

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard
        icon={<FileIcon />}
        title="program"
        subtitle={`plik na dysku SSD · ${step.bytes.length} bajtów`}
      />
      <ArrowRight />
      <FlowCard icon={<BlocksIcon />} title="odczyt bloków" subtitle="kontroler czyta sektory" />
      <ArrowRight />
      <FlowCard icon={<BytesIcon />} title="ciąg bajtów" subtitle="dane jako liczby 0–255" />
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8">
        {chars.map((ch, i) => {
          const bytes = Array.from(enc.encode(ch));
          return (
            <div key={i} className="flex flex-col items-center gap-3">
              <span className="font-heading text-7xl leading-none text-text-bright">
                {ch === ' ' ? '␣' : ch}
              </span>
              <ArrowDown />
              <div className="flex gap-1.5">
                {bytes.map((v, j) => (
                  <HexByte key={j} value={v} active tone="green" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </StepLayout>
  );
}

/* 3 · RAM — tabela Adres | Hex | Dec | Znaczenie, tekst podświetlony zielono */
export function RamStepView({ step, meta }: { step: RamStep; meta: StepMeta }) {
  const [hs, he] = step.highlight;
  const flat: { addr: number; byte: number; gi: number }[] = [];
  let gi = 0;
  for (const row of step.rows) {
    const base = parseInt(row.address.replace('0x', ''), 16) || 0;
    row.bytes.forEach((b, j) => {
      flat.push({ addr: base + j, byte: b, gi });
      gi++;
    });
  }
  const textBytes = flat.filter((f) => f.gi >= hs && f.gi < he).map((f) => f.byte);

  const graphic = (
    <div>
      <FieldLabel>Bajty z dysku</FieldLabel>
      <div className="mt-2 flex max-w-[170px] flex-wrap gap-1.5">
        {textBytes.map((b, i) => (
          <HexByte key={i} value={b} active />
        ))}
      </div>
      <div className="mt-4">
        <ArrowDown label="kopiowanie do RAM" />
      </div>
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-6 gap-y-1 font-mono text-sm">
        <span className="font-ui text-xs text-text-dim">Adres</span>
        <span className="font-ui text-xs text-text-dim">Hex</span>
        <span className="font-ui text-xs text-text-dim">Dec</span>
        <span className="font-ui text-xs text-text-dim">Znaczenie</span>
        {flat.map((f) => {
          const on = f.gi >= hs && f.gi < he;
          const ch = printable(f.byte);
          return (
            <div
              key={f.gi}
              className={`col-span-4 grid grid-cols-subgrid items-center rounded ${on ? 'bg-data-text/5' : ''}`}
            >
              <span className={on ? 'text-text' : 'text-text-dim'}>{addr8(f.addr)}</span>
              <span className={on ? 'text-data-text' : 'text-text-dim'}>{hex2(f.byte)}</span>
              <span className={on ? 'text-data-bytes' : 'text-text-dim'}>{f.byte}</span>
              <span className={on ? 'text-text-muted' : 'text-text-faint'}>
                {on && ch ? `„${ch}"` : f.byte === 0 ? 'koniec tekstu' : 'inne dane programu'}
              </span>
            </div>
          );
        })}
      </div>
    </StepLayout>
  );
}

/* 4 · CPU — kod maszynowy → dekodowanie → instrukcje */
export function CpuDecodeStepView({ step, meta }: { step: CpuDecodeStep; meta: StepMeta }) {
  const przed: { b: number; active: boolean }[] = [];
  step.instructions.forEach((ins, ii) =>
    ins.bytes.forEach((b) => przed.push({ b, active: ii === step.currentIndex })),
  );

  const graphic = (
    <div>
      <FieldLabel>Kod maszynowy w pamięci</FieldLabel>
      <div className="mt-2 flex max-w-sm flex-wrap gap-1.5">
        {przed.map((p, i) => (
          <HexByte key={i} value={p.b} active={p.active} />
        ))}
      </div>
      <div className="mt-4">
        <ArrowDown label="dekodowanie" />
      </div>
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col gap-1.5">
        {step.instructions.map((ins, i) => {
          const current = i === step.currentIndex;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-md border px-3 py-2 ${
                current ? 'border-data-instructions bg-data-instructions/5' : 'border-transparent'
              }`}
            >
              <span className="w-28 font-mono text-sm text-text-soft">{ins.address}</span>
              <div className="flex gap-1.5">
                {ins.bytes.map((b, j) => (
                  <HexByte key={j} value={b} />
                ))}
              </div>
              <span className="text-text-dim">→</span>
              <span className="font-mono text-sm text-data-instructions">{ins.asm}</span>
              {current && <Chip tone="accent">teraz</Chip>}
            </div>
          );
        })}
      </div>
    </StepLayout>
  );
}

/* 5 · UTF-8 — 3 wyrównane wiersze: Znaki / Liczby / Zapis binarny */
const CELL = 78;
const GAP = 8;

export function TextEncodeStepView({ step, meta }: { step: TextEncodeStep; meta: StepMeta }) {
  const cellW = (n: number) => n * CELL + (n - 1) * GAP;

  const graphic = (
    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-dim">
      <span className="text-data-text">znak</span> →<Chip>UTF-8</Chip> →
      <span className="text-data-bytes">liczba</span> →<span className="text-data-bits">bity</span>
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-40 shrink-0 font-ui text-xs text-text-dim">PRZED · Znaki</span>
          <div className="flex" style={{ gap: GAP }}>
            {step.chars.map((c, i) => (
              <div key={i} style={{ width: cellW(c.bytes.length) }} className="flex">
                <CharCard char={c.char} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-40 shrink-0 font-ui text-xs text-text-dim">UTF-8 · Liczby (dec)</span>
          <div className="flex" style={{ gap: GAP }}>
            {step.chars.flatMap((c) =>
              c.bytes.map((b, j) => (
                <div key={`${c.char}-${j}`} style={{ width: CELL }}>
                  <NumberCard dec={b} hex={`0x${hex2(b)}`} />
                </div>
              )),
            )}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-40 shrink-0 font-ui text-xs text-text-dim">PO · Zapis binarny</span>
          <div className="flex" style={{ gap: GAP }}>
            {step.chars.flatMap((c) =>
              c.bytes.map((b, j) => (
                <div key={`${c.char}-b-${j}`} style={{ width: CELL }}>
                  <BinaryCard bits={c.binary[j] ?? bin8(b)} />
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

/* 6 · Rasteryzacja — litery → rasteryzacja → siatka pikseli */
export function RasterStepView({ step, meta }: { step: RasterStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text);
  const chars = [...(text || 'Hello')];
  let hx = -1;
  let hy = -1;
  for (let y = 0; y < step.pixels.length && hy < 0; y++) {
    const x = step.pixels[y].indexOf(1);
    if (x >= 0) {
      hx = x;
      hy = y;
    }
  }

  const graphic = (
    <div>
      <FieldLabel>Tekst</FieldLabel>
      <div className="mt-2 flex max-w-[160px] flex-wrap gap-2">
        {chars.map((ch, i) => (
          <CharCard key={i} char={ch} />
        ))}
      </div>
      <div className="mt-4">
        <ArrowDown label="rasteryzacja" />
      </div>
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="inline-grid gap-0.5 rounded-md border border-border bg-bg2 p-2"
          style={{ gridTemplateColumns: `repeat(${step.width}, 14px)` }}
        >
          {step.pixels.flatMap((row, y) =>
            row.map((p, x) => {
              const hi = x === hx && y === hy;
              return (
                <span
                  key={`${x}-${y}`}
                  className={`h-3.5 w-3.5 rounded-sm ${hi ? 'bg-accent' : p ? 'bg-text-bright' : 'bg-surface-overlay'}`}
                />
              );
            }),
          )}
        </div>
        {hx >= 0 && (
          <div className="inline-flex rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-muted">
            x: {hx} · y: {hy} · <span className="ml-1 text-accent">zapalony</span>
          </div>
        )}
      </div>
    </StepLayout>
  );
}

/* 7 · Monitor — siatka RGB → wysłanie obrazu → ekran z tekstem */
export function DisplayStepView({ step, meta }: { step: DisplayStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text);

  const graphic = (
    <div>
      <FieldLabel>Piksele (R G B)</FieldLabel>
      <div className="mt-2 flex max-w-[220px] flex-wrap gap-2">
        {step.sample.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-bg2 p-2"
          >
            <span
              className="h-5 w-10 rounded-sm border border-border"
              style={{ background: `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]})` }}
            />
            <span className="font-mono text-xs text-data-bytes">
              {s.rgb[0]} {s.rgb[1]} {s.rgb[2]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 font-ui text-xs text-text-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#f87171]" /> R
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#4ade80]" /> G
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#60a5fa]" /> B
        </span>
      </div>
      <div className="mt-4">
        <ArrowDown label="wysłanie obrazu" />
      </div>
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-48 w-80 items-center justify-center rounded-lg border border-border bg-black">
          <span className="font-mono text-4xl tracking-widest text-text-bright">
            {text || 'Hello'}
          </span>
        </div>
        <p className="font-ui text-sm text-text-dim">Gotowe. Twój tekst jest na ekranie.</p>
      </div>
    </StepLayout>
  );
}
