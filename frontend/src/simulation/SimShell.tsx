import { useEffect, useRef, type ReactNode } from 'react';

import { FALLBACK_BANNER } from '../api/client';
import { parts } from '../data/parts';
import { stepMeta, type IconKey, type StepMeta } from '../data/steps';
import { useAppStore } from '../store/useAppStore';
import Scene from '../three/Scene';
import { ComponentIcon } from './ui';

// Domyślny model .glb na podzespół (z katalogu Maxa). Mysz usunięta z kroków.
const STEP_MODEL: Record<IconKey, string> = {
  mouse: '',
  ssd: 'ssd.glb',
  ram: 'ram-ddr4.glb',
  cpu: 'cpu.glb',
  gpu: 'gpu.glb',
  monitor: 'monitor-ips.glb',
};

/** Powłoka ekranu symulacji wg template'u z Figmy:
 *  górny pasek + pasek 7 kroków + układ (lewa karta | scena + opis) + dolny pasek. */

interface Props {
  index: number;
  meta: StepMeta;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (n: number) => void;
  children: ReactNode; // ciało lewej karty (widok kroku)
}

function EdgeArrow({
  dir,
  onClick,
  label,
  disabled,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-20 -translate-y-1/2 transition ${
        dir === 'left' ? 'left-3' : 'right-3'
      } ${disabled ? 'cursor-not-allowed text-text-faint/25' : 'text-accent/70 hover:text-accent'}`}
    >
      <svg
        width="44"
        height="72"
        viewBox="0 0 24 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dir === 'left' ? <path d="M16 6 L6 24 L16 42" /> : <path d="M8 6 L18 24 L8 42" />}
      </svg>
    </button>
  );
}

function StepDots({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === index;
        return (
          <span
            key={n}
            className={`h-1.5 rounded-pill transition-all duration-300 ease-out ${
              active ? 'w-5 bg-accent' : 'w-1.5 bg-text-faint/50'
            }`}
          />
        );
      })}
    </div>
  );
}

// Szerokość slotu karuzeli kroków (px).
const SLOT = 380;

function StepRail({ index, onSelect }: { index: number; onSelect: (n: number) => void }) {
  const total = stepMeta.length;
  const active = index - 1; // 0-based

  return (
    <div className="flex flex-col items-center py-5">
      <StepDots index={index} total={total} />

      {/* Karuzela: cały tor przesuwa się tak, by bieżący krok był na środku.
          Sąsiednie tytuły płynnie wjeżdżają/zjeżdżają i zmieniają skalę. */}
      <div className="relative mt-3 h-[76px] w-full overflow-hidden">
        <div
          className="absolute left-1/2 top-0 flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${-(active * SLOT + SLOT / 2)}px)` }}
        >
          {stepMeta.map((m, i) => {
            const isActive = i === active;
            const dist = Math.abs(i - active);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(i + 1)}
                style={{ width: SLOT, zIndex: isActive ? 2 : 1 }}
                className="flex shrink-0 flex-col items-center"
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className="flex flex-col items-center transition-all duration-500 ease-out"
                  style={{
                    transform: `scale(${isActive ? 1 : 0.5})`,
                    opacity: dist > 1 ? 0 : isActive ? 1 : 0.55,
                  }}
                >
                  <h2 className="whitespace-nowrap font-heading text-3xl text-text-bright">
                    {m.title}
                  </h2>
                  <span className="mt-1 flex items-center gap-1.5 font-mono text-base text-text-muted">
                    <ComponentIcon icon={m.icon} className="h-4 w-4" />
                    {m.component}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SimShell({ index, meta, onPrev, onNext, onSelect, children }: Props) {
  const usedFallback = useAppStore((s) => s.usedFallback);

  // Kierunek przejścia: dalej → wjazd z prawej, wstecz → z lewej.
  const prevIndexRef = useRef(index);
  const back = index < prevIndexRef.current;
  useEffect(() => {
    prevIndexRef.current = index;
  }, [index]);

  return (
    <div className="relative flex h-full flex-col">
      <StepRail index={index} onSelect={onSelect} />

      <EdgeArrow dir="left" onClick={onPrev} label="Poprzedni krok" disabled={index === 1} />
      <EdgeArrow dir="right" onClick={onNext} label="Następny krok" />

      {usedFallback && (
        <div className="mx-16 flex items-center gap-2 rounded-md border border-state-warning/40 bg-state-warning/10 px-4 py-2 font-ui text-sm text-state-warning">
          <span aria-hidden>⚠</span>
          <span>{FALLBACK_BANNER}</span>
        </div>
      )}

      <div className="grid flex-1 grid-cols-[1.9fr_1fr] gap-5 overflow-y-auto overflow-x-hidden px-16 py-5">
        {/* lewa karta: nagłówek + ciało kroku (animuje się przy zmianie kroku) */}
        <section className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-6">
          <div
            key={index}
            className={`flex flex-1 flex-col ${back ? 'sim-step-enter sim-step-enter--back' : 'sim-step-enter'}`}
          >
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        </section>

        {/* prawa kolumna: model 3D (bez ramki, obracalny) + sam tekst na dole */}
        <aside className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <Scene modelUrl={`/models/${STEP_MODEL[meta.icon]}`} />
          </div>
          <div className="mt-4">
            <h2 className="font-heading text-lg text-text-bright">{meta.stageLabel}</h2>
            <p className="mt-2 font-ui text-base text-text-muted">{parts[meta.part].tagline}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
