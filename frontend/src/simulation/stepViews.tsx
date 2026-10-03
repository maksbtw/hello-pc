import type {
  MouseStep,
  SsdStep,
  RamStep,
  CpuDecodeStep,
  TextEncodeStep,
  RasterStep,
  DisplayStep,
} from '../types/api';
import { useAppStore } from '../store/useAppStore';
import { BinaryCard, CharCard, Chip, FieldLabel, HexByte, NumberCard } from './ui';

/** Dedykowane widoki PRZED→PO dla kroków symulacji (wg template'u z Figmy). */

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
const bin8 = (n: number) => (n & 0xff).toString(2).padStart(8, '0');
const addr4 = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');
const addr8 = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(8, '0');
const printable = (b: number) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : null);

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
      <path d="M4 2 h12 l6 6 v20 a0 0 0 0 1 0 0 H4 Z" strokeLinejoin="round" />
      <path d="M16 2 v6 h6" strokeLinejoin="round" />
    </svg>
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

/* 2 · SSD — hex-dump z adresami, tekst podświetlony na zielono */
export function SsdStepView({ step }: { step: SsdStep }) {
  const [hs, he] = step.highlight;
  const rows: number[][] = [];
  for (let i = 0; i < step.bytes.length; i += 16) rows.push(step.bytes.slice(i, i + 16));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <FieldLabel>Przed</FieldLabel>
        <div className="flex items-center gap-3 rounded-md border border-border bg-bg2 px-4 py-3">
          <FileIcon />
          <div>
            <div className="font-mono text-sm text-text">program</div>
            <div className="font-mono text-xs text-text-dim">
              plik na dysku SSD · {step.bytes.length} bajtów
            </div>
          </div>
        </div>
        <ArrowRight />
        <Chip>odczyt bloków</Chip>
        <ArrowRight />
        <FieldLabel>PO · bajty pliku (hex, 16 w rzędzie)</FieldLabel>
      </div>

      <div className="mt-6 flex flex-col gap-1.5">
        {rows.map((row, r) => (
          <div key={r} className="flex items-center gap-3">
            <span className="w-12 font-mono text-xs text-text-dim">{addr4(r * 16)}</span>
            <div className="flex gap-1.5">
              {row.map((b, c) => {
                const gi = r * 16 + c;
                return <HexByte key={c} value={b} active={gi >= hs && gi < he} tone="green" />;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-6 font-ui text-xs text-text-dim">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-data-text/70" /> Twój tekst
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-border" /> Nagłówek i kod programu
        </span>
      </div>
    </div>
  );
}

/* 3 · RAM — tabela Adres | Hex | Dec | Znaczenie, tekst podświetlony zielono */
export function RamStepView({ step }: { step: RamStep }) {
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

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div>
        <FieldLabel>PRZED · bajty z dysku</FieldLabel>
        <div className="mt-3 flex max-w-[180px] flex-wrap gap-1.5">
          {textBytes.map((b, i) => (
            <HexByte key={i} value={b} active />
          ))}
        </div>
        <div className="mt-6">
          <ArrowDown label="kopiowanie do RAM" />
        </div>
      </div>

      <div className="flex-1">
        <FieldLabel>PO · pamięć RAM: każdy bajt ma adres</FieldLabel>
        <div className="mt-3 grid grid-cols-[auto_auto_auto_1fr] gap-x-6 gap-y-1 font-mono text-sm">
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
                className={`col-span-4 grid grid-cols-subgrid items-center rounded ${
                  on ? 'bg-data-text/5' : ''
                }`}
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
      </div>
    </div>
  );
}

/* 4 · CPU — kod maszynowy → dekodowanie → instrukcje */
export function CpuDecodeStepView({ step }: { step: CpuDecodeStep }) {
  const przed: { b: number; active: boolean }[] = [];
  step.instructions.forEach((ins, ii) =>
    ins.bytes.forEach((b) => przed.push({ b, active: ii === step.currentIndex })),
  );

  return (
    <div>
      <FieldLabel>PRZED · kod maszynowy w pamięci</FieldLabel>
      <div className="mt-3 flex max-w-2xl flex-wrap gap-1.5">
        {przed.map((p, i) => (
          <HexByte key={i} value={p.b} active={p.active} />
        ))}
      </div>

      <div className="mt-4">
        <ArrowDown label="dekodowanie" />
      </div>

      <FieldLabel>PO · instrukcje programu</FieldLabel>
      <div className="mt-3 flex flex-col gap-1.5">
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
    </div>
  );
}

/* 5 · UTF-8 — 3 wyrównane wiersze: Znaki / Liczby / Zapis binarny */
const CELL = 78;
const GAP = 8;

export function TextEncodeStepView({ step }: { step: TextEncodeStep }) {
  const cellW = (n: number) => n * CELL + (n - 1) * GAP;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-dim">
        <span className="text-data-text">znak</span> →<Chip>kodowanie UTF-8</Chip> →
        <span className="text-data-bytes">liczba</span> →<Chip>zapis binarny</Chip> →
        <span className="text-data-bits">bity</span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {/* Znaki */}
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

        {/* Liczby */}
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

        {/* Binarnie */}
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
    </div>
  );
}

/* 6 · Rasteryzacja — litery → rasteryzacja → siatka pikseli */
export function RasterStepView({ step }: { step: RasterStep }) {
  const text = useAppStore((s) => s.text);
  const chars = [...(text || 'Hello')];
  // pierwszy zapalony piksel do podświetlenia
  let hx = -1;
  let hy = -1;
  for (let y = 0; y < step.pixels.length && hy < 0; y++) {
    const x = step.pixels[y].indexOf(1);
    if (x >= 0) {
      hx = x;
      hy = y;
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div>
        <FieldLabel>PRZED · tekst</FieldLabel>
        <div className="mt-3 flex max-w-[160px] flex-wrap gap-2">
          {chars.map((ch, i) => (
            <CharCard key={i} char={ch} />
          ))}
        </div>
        <div className="mt-6">
          <ArrowDown label="rasteryzacja" />
        </div>
      </div>

      <div>
        <FieldLabel>PO · siatka pikseli ({step.width}×{step.height})</FieldLabel>
        <div
          className="mt-3 inline-grid gap-0.5 rounded-md border border-border bg-bg2 p-2"
          style={{ gridTemplateColumns: `repeat(${step.width}, 14px)` }}
        >
          {step.pixels.flatMap((row, y) =>
            row.map((p, x) => {
              const hi = x === hx && y === hy;
              return (
                <span
                  key={`${x}-${y}`}
                  className={`h-3.5 w-3.5 rounded-sm ${
                    hi ? 'bg-accent' : p ? 'bg-text-bright' : 'bg-surface-overlay'
                  }`}
                />
              );
            }),
          )}
        </div>
        {hx >= 0 && (
          <div className="mt-3 inline-flex rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-muted">
            x: {hx} · y: {hy} · <span className="ml-1 text-accent">zapalony</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* 7 · Monitor — siatka RGB → wysłanie obrazu → ekran z tekstem */
export function DisplayStepView({ step }: { step: DisplayStep }) {
  const text = useAppStore((s) => s.text);
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div>
        <FieldLabel>PRZED · fragment siatki (R G B)</FieldLabel>
        <div className="mt-3 flex max-w-[260px] flex-wrap gap-2">
          {step.sample.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 rounded-md border border-border bg-bg2 p-2"
            >
              <span
                className="h-5 w-12 rounded-sm border border-border"
                style={{ background: `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]})` }}
              />
              <span className="font-mono text-xs text-data-bytes">
                {s.rgb[0]} {s.rgb[1]} {s.rgb[2]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <ArrowDown label="wysłanie obrazu" />
        </div>
        <div className="mt-6 flex items-center gap-4 font-ui text-xs text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#f87171]" /> R
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#4ade80]" /> G
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#60a5fa]" /> B
          </span>
          <span>0–255</span>
        </div>
      </div>

      <div>
        <FieldLabel>PO · monitor</FieldLabel>
        <div className="mt-3 flex h-44 w-80 items-center justify-center rounded-lg border border-border bg-black">
          <span className="font-mono text-4xl tracking-widest text-text-bright">
            {text || 'Hello'}
          </span>
        </div>
        <p className="mt-3 font-ui text-sm text-text-dim">Gotowe. Twój tekst jest na ekranie.</p>
      </div>
    </div>
  );
}
