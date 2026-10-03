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

/** Dedykowane widoki PRZED→PO dla 7 kroków symulacji. */

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
const bin8 = (n: number) => (n & 0xff).toString(2).padStart(8, '0');

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-text-dim">
      {label && <span className="font-mono text-xs">{label}</span>}
      <span className="text-xl text-accent">→</span>
    </div>
  );
}

/* 1 · Mysz */
export function MouseStepView({ step }: { step: MouseStep }) {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex flex-col items-center gap-2 text-text-muted">
        <FieldLabel>Przed</FieldLabel>
        <div className="flex h-24 w-16 items-center justify-center rounded-md border border-border bg-bg2 font-mono text-xs">
          klik
        </div>
        <span className="font-ui text-xs">Lewy przycisk: wciśnięty</span>
      </div>

      <div className="self-center pt-6">
        <Arrow label="raport USB HID" />
      </div>

      <div>
        <FieldLabel>PO · paczka danych USB, 4 bajty</FieldLabel>
        <div className="mt-3 flex flex-wrap gap-4">
          {step.bytes.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="font-ui text-xs text-text-dim">{step.labels[i] ?? `bajt ${i}`}</span>
              <NumberCard dec={b} hex={`0x${hex2(b)}`} />
              <BinaryCard bits={bin8(b)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 2 · SSD */
export function SsdStepView({ step }: { step: SsdStep }) {
  const [hs, he] = step.highlight;
  return (
    <div>
      <FieldLabel>PO · bajty pliku (hex)</FieldLabel>
      <div className="mt-3 grid max-w-xl grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5">
        {step.bytes.map((b, i) => (
          <HexByte key={i} value={b} active={i >= hs && i < he} />
        ))}
      </div>
      <p className="mt-4 font-ui text-sm text-text-dim">
        Podświetlone bajty to Twój tekst wśród danych programu.
      </p>
    </div>
  );
}

/* 3 · RAM */
export function RamStepView({ step }: { step: RamStep }) {
  const [hs, he] = step.highlight;
  let offset = 0;
  return (
    <div>
      <FieldLabel>PO · pamięć RAM: każdy bajt ma adres</FieldLabel>
      <div className="mt-3 flex flex-col gap-2">
        {step.rows.map((row, r) => {
          const base = offset;
          offset += row.bytes.length;
          return (
            <div key={r} className="flex items-center gap-4">
              <span className="w-20 font-mono text-sm text-text-soft">{row.address}</span>
              <div className="flex gap-1.5">
                {row.bytes.map((b, i) => {
                  const gi = base + i;
                  return <HexByte key={i} value={b} active={gi >= hs && gi < he} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 4 · CPU — dekodowanie */
export function CpuDecodeStepView({ step }: { step: CpuDecodeStep }) {
  return (
    <div>
      <FieldLabel>PO · instrukcje programu</FieldLabel>
      <div className="mt-3 flex flex-col gap-2">
        {step.instructions.map((ins, i) => {
          const current = i === step.currentIndex;
          return (
            <div
              key={i}
              className={[
                'flex items-center gap-4 rounded-md border px-3 py-2',
                current ? 'border-data-instructions bg-data-instructions/5' : 'border-transparent',
              ].join(' ')}
            >
              <span className="w-24 font-mono text-sm text-text-soft">{ins.address}</span>
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

/* 5 · Tekst jako liczby (UTF-8) */
export function TextEncodeStepView({ step }: { step: TextEncodeStep }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-dim">
        <span className="text-data-text">znak</span> →<Chip>kodowanie UTF-8</Chip> →
        <span className="text-data-bytes">liczba</span> →<Chip>zapis binarny</Chip> →
        <span className="text-data-bits">bity</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-6">
        {step.chars.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <CharCard char={c.char} />
            <div className="flex gap-2">
              {c.bytes.map((b, j) => (
                <div key={j} className="flex flex-col items-center gap-2">
                  <NumberCard dec={b} hex={`0x${hex2(b)}`} />
                  <BinaryCard bits={c.binary[j] ?? bin8(b)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6 · Rasteryzacja */
export function RasterStepView({ step }: { step: RasterStep }) {
  return (
    <div>
      <FieldLabel>PO · siatka pikseli ({step.width}×{step.height})</FieldLabel>
      <div
        className="mt-3 inline-grid gap-0.5 rounded-md border border-border bg-bg2 p-2"
        style={{ gridTemplateColumns: `repeat(${step.width}, 14px)` }}
      >
        {step.pixels.flat().map((p, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-sm ${p ? 'bg-accent' : 'bg-surface-overlay'}`}
          />
        ))}
      </div>
      <p className="mt-4 font-ui text-sm text-text-dim">
        Zapalony piksel = 1, zgaszony = 0. Z takich punktów powstaje obraz liter.
      </p>
    </div>
  );
}

/* 7 · Monitor */
export function DisplayStepView({ step }: { step: DisplayStep }) {
  const text = useAppStore((s) => s.text);
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div>
        <FieldLabel>PO · monitor</FieldLabel>
        <div className="mt-3 flex h-44 w-72 items-center justify-center rounded-md border border-border bg-black">
          <span className="font-mono text-3xl tracking-widest text-text-bright">{text || 'Hello'}</span>
        </div>
        <p className="mt-3 font-ui text-sm text-text-dim">Gotowe. Twój tekst jest na ekranie.</p>
      </div>

      <div>
        <FieldLabel>Próbki pikseli (R G B)</FieldLabel>
        <div className="mt-3 flex flex-col gap-2">
          {step.sample.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="h-6 w-6 rounded border border-border"
                style={{ background: `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]})` }}
              />
              <span className="font-mono text-xs text-text-dim">
                ({s.x}, {s.y})
              </span>
              <span className="font-mono text-sm text-data-bytes">
                {s.rgb[0]} {s.rgb[1]} {s.rgb[2]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
