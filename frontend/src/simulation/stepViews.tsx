import { useEffect, useMemo, useState, type ReactNode } from 'react';

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
import { BinaryCard, CharCard, HexByte, NumberCard } from './ui';

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

function RamIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <rect x="2" y="8" width="22" height="13" rx="1.5" />
      <line x1="7" y1="11" x2="7" y2="18" />
      <line x1="11" y1="11" x2="11" y2="18" />
      <line x1="15" y1="11" x2="15" y2="18" />
      <line x1="19" y1="11" x2="19" y2="18" />
      <line x1="6" y1="21" x2="6" y2="24" />
      <line x1="20" y1="21" x2="20" y2="24" />
    </svg>
  );
}

function AddrIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <rect x="3" y="5" width="20" height="20" rx="2" />
      <line x1="3" y1="11" x2="23" y2="11" />
      <line x1="3" y1="17" x2="23" y2="17" />
      <circle cx="6.5" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="20" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <rect x="7" y="9" width="12" height="12" rx="1.5" />
      <rect x="10.5" y="12.5" width="5" height="5" rx="0.5" />
      <line x1="10" y1="9" x2="10" y2="6" />
      <line x1="13" y1="9" x2="13" y2="6" />
      <line x1="16" y1="9" x2="16" y2="6" />
      <line x1="10" y1="24" x2="10" y2="21" />
      <line x1="13" y1="24" x2="13" y2="21" />
      <line x1="16" y1="24" x2="16" y2="21" />
      <line x1="7" y1="12" x2="4" y2="12" />
      <line x1="7" y1="18" x2="4" y2="18" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="19" y1="18" x2="22" y2="18" />
    </svg>
  );
}

function InstrIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <path d="M7 10 l-3 5 l3 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 10 l3 5 l-3 5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14.5" y1="8" x2="11" y2="22" strokeLinecap="round" />
    </svg>
  );
}

function GlyphIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <path d="M8 22 L13 8 L18 22" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="17" x2="16" y2="17" strokeLinecap="round" />
    </svg>
  );
}

function BitsIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="text-text-soft">
      <text x="3" y="13" fontFamily="monospace" fontSize="9" fill="currentColor">10</text>
      <text x="14" y="13" fontFamily="monospace" fontSize="9" fill="currentColor">01</text>
      <text x="3" y="25" fontFamily="monospace" fontSize="9" fill="currentColor">00</text>
      <text x="14" y="25" fontFamily="monospace" fontSize="9" fill="currentColor">11</text>
    </svg>
  );
}

function PixelIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-text-soft">
      <rect x="4" y="6" width="18" height="18" rx="1" />
      <line x1="10" y1="6" x2="10" y2="24" />
      <line x1="16" y1="6" x2="16" y2="24" />
      <line x1="4" y1="12" x2="22" y2="12" />
      <line x1="4" y1="18" x2="22" y2="18" />
      <rect x="10" y="12" width="6" height="6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <rect x="3" y="6" width="20" height="14" rx="1.5" />
      <line x1="10" y1="24" x2="16" y2="24" strokeLinecap="round" />
      <line x1="13" y1="20" x2="13" y2="24" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-soft">
      <path d="M3 15 h4 l2 -7 l4 14 l3 -10 l2 3 h5" strokeLinecap="round" strokeLinejoin="round" />
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
export function SsdStepView({ meta }: { step: SsdStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text);
  const chars = [...(text || 'Hello')];
  const enc = new TextEncoder();
  const byteCount = enc.encode(text || 'Hello').length;

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard
        icon={<FileIcon />}
        title="program"
        subtitle={`plik na dysku SSD · ${byteCount} bajtów`}
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
            <div
              key={i}
              className="sim-rise flex flex-col items-center gap-3"
              style={{ animationDelay: `${i * 90}ms` }}
            >
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
export function RamStepView({ meta }: { step: RamStep; meta: StepMeta }) {
  // Dane liczymy z wpisanego tekstu (spójnie z krokiem I), a nie z mocka.
  const text = useAppStore((s) => s.text) || 'Hello';
  const textBytes = Array.from(new TextEncoder().encode(text));
  // Wiersze tabeli: bajty tekstu + 2 bajty 0x00 (koniec tekstu) dla kontekstu.
  const flat = [
    ...textBytes.map((byte, i) => ({ addr: i, byte, on: true })),
    { addr: textBytes.length, byte: 0, on: false },
    { addr: textBytes.length + 1, byte: 0, on: false },
  ];

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard icon={<BytesIcon />} title="bajty z dysku" subtitle={`ciąg ${textBytes.length} liczb`} />
      <ArrowRight />
      <FlowCard icon={<RamIcon />} title="kopiowanie do RAM" subtitle="szybka pamięć" />
      <ArrowRight />
      <FlowCard icon={<AddrIcon />} title="adresowanie" subtitle="każdy bajt ma adres" />
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="grid grid-cols-[auto_auto_auto_1fr] gap-x-6 gap-y-1 font-mono text-sm">
        <span className="font-ui text-xs text-text-dim">Adres</span>
        <span className="font-ui text-xs text-text-dim">Hex</span>
        <span className="font-ui text-xs text-text-dim">Dec</span>
        <span className="font-ui text-xs text-text-dim">Znaczenie</span>
        {flat.map((f, i) => {
          const ch = printable(f.byte);
          return (
            <div
              key={f.addr}
              className={`sim-rise col-span-4 grid grid-cols-subgrid items-center rounded ${f.on ? 'bg-data-text/5' : ''}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className={f.on ? 'text-text' : 'text-text-dim'}>{addr8(f.addr)}</span>
              <span className={f.on ? 'text-data-text' : 'text-text-dim'}>{hex2(f.byte)}</span>
              <span className={f.on ? 'text-data-bytes' : 'text-text-dim'}>{f.byte}</span>
              <span className={f.on ? 'text-text-muted' : 'text-text-faint'}>
                {f.on && ch ? `„${ch}"` : f.byte === 0 ? 'koniec tekstu' : 'inne dane'}
              </span>
            </div>
          );
        })}
      </div>
    </StepLayout>
  );
}

/* 4 · CPU — program liczony z tekstu: po jednej instrukcji „wypisz" na znak */
export function CpuDecodeStepView({ meta }: { step: CpuDecodeStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text) || 'Hello';
  const enc = new TextEncoder();
  const chars = [...text];

  // Dla każdego znaku: MOV AL, <bajt> (B0 XX) + INT 0x21 (CD 21) — „wypisz znak".
  const allInstructions = chars.flatMap((ch, i) => {
    const code = enc.encode(ch)[0];
    const label = ch === ' ' ? '␣' : ch;
    return [
      { addr: i * 4, bytes: [0xb0, code], asm: `MOV AL, '${label}'`, ch: label },
      { addr: i * 4 + 2, bytes: [0xcd, 0x21], asm: 'INT 0x21', ch: label },
    ];
  });
  // Pokazujemy maksymalnie 6 przykładowych instrukcji (3 na kolumnę).
  const instructions = allInstructions.slice(0, 6);
  const more = allInstructions.length - instructions.length;
  const totalBytes = allInstructions.reduce((n, ins) => n + ins.bytes.length, 0);

  // „Teraz" przesuwa się po instrukcjach — jakby procesor wykonywał je po kolei.
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCurrentIndex((c) => (c + 1) % instructions.length),
      1800,
    );
    return () => clearInterval(id);
  }, [instructions.length]);

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard icon={<BytesIcon />} title="kod maszynowy" subtitle={`${totalBytes} bajtów`} />
      <ArrowRight />
      <FlowCard icon={<CpuIcon />} title="dekoder" subtitle="rozpoznaje polecenie" />
      <ArrowRight />
      <FlowCard icon={<InstrIcon />} title="instrukcja" subtitle={`${allInstructions.length} poleceń`} />
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="w-full max-w-4xl">
      <div className="columns-2 gap-x-8">
        {instructions.map((ins, i) => {
          const current = i === currentIndex;
          return (
            <div
              key={i}
              className={`sim-rise mb-2 flex break-inside-avoid items-center gap-3 rounded-md border px-3 py-2.5 transition-all duration-700 ease-in-out ${
                current
                  ? 'sim-glow border-data-instructions bg-data-instructions/10'
                  : 'border-transparent opacity-50'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="w-20 shrink-0 font-mono text-sm text-text-soft">
                0x{ins.addr.toString(16).toUpperCase().padStart(4, '0')}
              </span>
              <div className="flex shrink-0 gap-1.5">
                {ins.bytes.map((b, j) => (
                  <HexByte key={j} value={b} active={current} size="lg" />
                ))}
              </div>
              <span className="text-text-dim">→</span>
              <span className="flex-1 whitespace-nowrap font-mono text-sm text-data-instructions">
                {ins.asm}
              </span>
              <span
                className={`inline-flex items-center rounded-pill border border-accent/50 bg-accent/10 px-2.5 py-0.5 font-mono text-xs text-accent transition-opacity duration-700 ease-in-out ${
                  current ? 'opacity-100' : 'opacity-0'
                }`}
              >
                teraz
              </span>
            </div>
          );
        })}
      </div>
      {more > 0 && (
        <p className="mt-3 text-center font-mono text-xs text-text-dim">
          … i jeszcze {more} instrukcji dla pozostałych znaków
        </p>
      )}
      </div>
    </StepLayout>
  );
}

/* 5 · UTF-8 — 3 wyrównane wiersze: Znaki / Liczby / Zapis binarny */
const CELL = 46;
const GAP = 12;

export function TextEncodeStepView({ meta }: { step: TextEncodeStep; meta: StepMeta }) {
  const cellW = (n: number) => n * CELL + (n - 1) * GAP;
  // Dane z wpisanego tekstu (spójnie z pozostałymi krokami).
  const text = useAppStore((s) => s.text) || 'Hello';
  const enc = new TextEncoder();
  const chars = [...text].map((char) => {
    const bytes = Array.from(enc.encode(char));
    return { char, bytes, binary: bytes.map((b) => bin8(b)) };
  });
  // Płaska lista bajtów (do wyrównanych wierszy + opóźnień animacji).
  const flatBytes = chars.flatMap((c) => c.bytes);

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard icon={<GlyphIcon />} title="znak" subtitle="litera tekstu" />
      <ArrowRight />
      <FlowCard icon={<BytesIcon />} title="UTF-8" subtitle="liczba 0–255" />
      <ArrowRight />
      <FlowCard icon={<BitsIcon />} title="bity" subtitle="8 zer i jedynek" />
    </div>
  );

  let bi = 0; // indeks bajtu (do stagger animacji)
  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex max-w-full flex-col gap-3 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-20 shrink-0 font-ui text-xs text-text-dim">Znaki</span>
          <div className="flex" style={{ gap: GAP }}>
            {chars.map((c, i) => (
              <div
                key={i}
                style={{ width: cellW(c.bytes.length), animationDelay: `${i * 90}ms` }}
                className="sim-rise flex"
              >
                <CharCard char={c.char} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-20 shrink-0 font-ui text-xs text-text-dim">Liczby (dec)</span>
          <div className="flex" style={{ gap: GAP }}>
            {chars.flatMap((c) =>
              c.bytes.map((b, j) => {
                const k = bi++;
                return (
                  <div
                    key={`${c.char}-${k}-${j}`}
                    style={{ width: CELL, animationDelay: `${300 + k * 70}ms` }}
                    className="sim-pop-flat"
                  >
                    <NumberCard dec={b} hex={`0x${hex2(b)}`} />
                  </div>
                );
              }),
            )}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: GAP }}>
          <span className="w-20 shrink-0 font-ui text-xs text-text-dim">Bity</span>
          <div className="flex" style={{ gap: GAP }}>
            {flatBytes.map((b, k) => (
              <div
                key={`b-${k}`}
                style={{ width: CELL, animationDelay: `${600 + k * 70}ms` }}
                className="sim-bit"
              >
                <BinaryCard bits={bin8(b)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

/* Rasteryzacja całego napisu: ta sama czcionka daje piksele 0/1 ORAZ gładki
   obraz w tej samej geometrii (ten sam font, origin i przycięcie) — dzięki temu
   gładki tekst nakłada się 1:1 na siatkę pikseli. */
const RASTER_FONT_PX = 13;
function rasterizeText(text: string): { rows: number[][]; cols: number; smoothSrc: string } {
  if (typeof document === 'undefined') return { rows: [], cols: 0, smoothSrc: '' };
  const font = `bold ${RASTER_FONT_PX}px monospace`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { rows: [], cols: 0, smoothSrc: '' };
  ctx.font = font;
  const w = Math.max(1, Math.ceil(ctx.measureText(text).width) + 2);
  const h = RASTER_FONT_PX + 4;
  canvas.width = w;
  canvas.height = h;
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, 1, 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const full: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) row.push(data[(y * w + x) * 4 + 3] > 110 ? 1 : 0);
    full.push(row);
  }
  // przytnij puste wiersze u góry/dołu (zapamiętaj ile ucięto z góry)
  const nonEmpty = (r: number[]) => r.some((v) => v === 1);
  let top = 0;
  let bottom = full.length;
  while (top < bottom && !nonEmpty(full[top])) top++;
  while (bottom > top && !nonEmpty(full[bottom - 1])) bottom--;
  const rows = full.slice(top, bottom);
  const rowCount = rows.length || 1;

  // Gładki wariant: ten sam napis, ten sam font i origin, wyrenderowany w wysokiej
  // rozdzielczości na przyciętym obszarze (w × rowCount w jednostkach źródłowych).
  const ss = 8; // nadpróbkowanie dla ostrości
  const c2 = document.createElement('canvas');
  c2.width = w * ss;
  c2.height = rowCount * ss;
  const x2 = c2.getContext('2d');
  let color = '#eceef2';
  const probe = document.createElement('span');
  probe.className = 'text-text-bright';
  probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
  document.body.appendChild(probe);
  color = getComputedStyle(probe).color || color;
  probe.remove();
  let smoothSrc = '';
  if (x2) {
    x2.scale(ss, ss);
    x2.font = font;
    x2.textBaseline = 'top';
    x2.fillStyle = color;
    x2.fillText(text, 1, 2 - top); // ten sam origin, przesunięty o ucięte wiersze
    smoothSrc = c2.toDataURL();
  }
  return { rows, cols: w, smoothSrc };
}

/* 6 · Rasteryzacja — cały napis → siatka pikseli, potem płynne przejście w gładki tekst */
export function RasterStepView({ meta }: { step: RasterStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text) || 'Hello';
  const chars = [...text];
  const { rows, cols, smoothSrc } = useMemo(() => rasterizeText(text), [text]);
  const rowCount = rows.length;
  // Rozmiar piksela tak, by cały napis zmieścił się w ~580 px.
  const cell = Math.max(4, Math.min(9, Math.floor(580 / Math.max(cols, 1))));
  const gridW = cols * cell;
  const gridH = rowCount * cell;

  // Pętla: piksele (od lewej) → gładki tekst (raster) → puste czarne tło → od nowa.
  // Czarny box zostaje cały czas; zmienia się tylko treść w środku.
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<'pixels' | 'smooth' | 'out'>('pixels');
  useEffect(() => {
    setPhase('pixels');
    const popDur = cols * 14 + 650; // zapalanie pikseli (od lewej) + „pop"
    const holdSmooth = 1500; // trzymaj gładki tekst
    const holdBlack = 650; // puste czarne tło
    const fade = 700; // czas przejść opacity
    const t1 = setTimeout(() => setPhase('smooth'), popDur);
    const t2 = setTimeout(() => setPhase('out'), popDur + fade + holdSmooth);
    const t3 = setTimeout(
      () => setCycle((c) => c + 1),
      popDur + fade + holdSmooth + fade + holdBlack,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cycle, text, cols]);

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard icon={<GlyphIcon />} title="litery" subtitle={`${chars.length} znaków`} />
      <ArrowRight />
      <FlowCard icon={<PixelIcon />} title="rasteryzacja" subtitle="rysowanie z pikseli" />
      <ArrowRight />
      <FlowCard icon={<ScreenIcon />} title="piksele" subtitle="1 = zapalony, 0 = zgaszony" />
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col items-center gap-3">
        {/* czarny box — zostaje cały czas, większy margines wokół tekstu */}
        <div className="flex items-center justify-center rounded-lg border border-border bg-bg2 px-12 py-10">
          <div className="relative" style={{ width: gridW, height: gridH }}>
            {/* 1) piksele (od lewej) — widoczne najpierw; montują się na starcie cyklu */}
            {phase !== 'out' && (
              <div
                key={cycle}
                className="absolute inset-0 grid transition-opacity duration-700 ease-in-out"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
                  opacity: phase === 'pixels' ? 1 : 0,
                }}
              >
                {rows.flatMap((row, y) =>
                  row.map((p, x) => (
                    <span
                      key={`${x}-${y}`}
                      className={p ? 'bg-text-bright sim-pop' : 'bg-transparent'}
                      style={{
                        width: cell,
                        height: cell,
                        ...(p ? { animationDelay: `${x * 14}ms` } : {}),
                      }}
                    />
                  )),
                )}
              </div>
            )}

            {/* 2) gładki tekst (raster) — wchodzi na piksele, potem gaśnie do czarnego */}
            <img
              src={smoothSrc}
              alt={text}
              draggable={false}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ width: gridW, height: gridH, opacity: phase === 'smooth' ? 1 : 0 }}
            />
          </div>
        </div>

      </div>
    </StepLayout>
  );
}

/* 7 · Monitor — rasteryzowany tekst „drukuje się" na ekranie znak po znaku */
export function DisplayStepView({ meta }: { step: DisplayStep; meta: StepMeta }) {
  const text = useAppStore((s) => s.text) || 'Hello';
  const { rows, cols, smoothSrc } = useMemo(() => rasterizeText(text), [text]);
  const rowCount = rows.length;
  const cell = Math.max(3, Math.min(5, Math.floor(280 / Math.max(cols, 1))));
  const gridW = cols * cell;
  const gridH = rowCount * cell;
  const screenW = gridW + 60;
  const screenH = Math.round(screenW * 0.6);

  // „Drukowanie" na monitorze: rasteryzowany tekst pojawia się znak po znaku.
  const nchars = [...text].length || 1;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let id: ReturnType<typeof setTimeout>;
    const run = () => {
      setShown(0);
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setShown(i);
        if (i < nchars) {
          id = setTimeout(tick, 240); // kolejny znak
        } else {
          id = setTimeout(run, 2000); // gotowe → chwila przerwy → od nowa
        }
      };
      id = setTimeout(tick, 240);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [text, nchars]);
  const revealW = Math.round((shown / nchars) * gridW);

  const graphic = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <FlowCard icon={<PixelIcon />} title="obraz pikseli" subtitle="efekt rasteryzacji" />
      <ArrowRight />
      <FlowCard icon={<SignalIcon />} title="sygnał wideo" subtitle="wysłanie do monitora" />
      <ArrowRight />
      <FlowCard icon={<ScreenIcon />} title="ekran" subtitle="wypisuje znak po znaku" />
    </div>
  );

  return (
    <StepLayout graphic={graphic} meta={meta}>
      <div className="flex flex-col items-center gap-8">
        {/* monitor: ekran na podstawce (skala ~1.2) */}
        <div className="flex flex-col items-center" style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
          {/* ekran monitora — proporcje jak prawdziwy ekran (tekst wyśrodkowany) */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-xl border-4 border-surface bg-black shadow-[0_0_40px_rgba(96,165,250,0.18)]"
            style={{ width: screenW, height: screenH }}
          >
            <div className="relative" style={{ width: gridW, height: gridH }}>
              {/* rasteryzowany tekst odsłaniany znak po znaku (drukowanie) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: revealW }}
              >
                <img
                  src={smoothSrc}
                  alt={text}
                  draggable={false}
                  style={{ width: gridW, height: gridH, maxWidth: 'none' }}
                />
              </div>
              {/* migający kursor na krawędzi „druku" */}
              <span
                className="sim-cursor absolute top-0 bg-text-bright"
                style={{ left: revealW + 2, width: Math.max(2, Math.round(cell * 0.6)), height: gridH }}
              />
            </div>
          </div>
          {/* szyjka */}
          <div className="bg-surface-overlay" style={{ width: Math.round(screenW * 0.14), height: Math.round(screenH * 0.16) }} />
          {/* podstawa (trapez) — większa */}
          <div
            className="rounded-sm bg-surface-overlay"
            style={{
              width: Math.round(screenW * 0.85),
              height: 16,
              clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>
        <p className="font-ui text-sm text-text-dim">Gotowe. Twój tekst jest na ekranie.</p>
      </div>
    </StepLayout>
  );
}
