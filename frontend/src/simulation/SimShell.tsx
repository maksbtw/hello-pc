import { useEffect, useRef, type ReactNode } from 'react';

import { FALLBACK_BANNER } from '../api/client';
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
  index: number; // 1..total
  total: number;
  meta: StepMeta;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (n: number) => void;
  onFinish: () => void;
  isAuto: boolean;
  onToggleAuto: () => void;
  children: ReactNode; // ciało lewej karty (widok kroku)
}

function TopBar() {
  return (
    <header className="flex items-center gap-2 px-6 py-3">
      <span className="text-accent">✦</span>
      <span className="font-heading text-md text-text-bright">PC Workshop</span>
    </header>
  );
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

function NeighborStep({
  meta,
  side,
  onClick,
}: {
  meta: StepMeta;
  side: 'prev' | 'next';
  onClick: () => void;
}) {
  const isPrev = side === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group max-w-[170px] text-text-dim transition-colors hover:text-text-muted ${
        isPrev ? 'text-right' : 'text-left'
      }`}
    >
      <div className="truncate font-ui text-sm">{meta.title}</div>
      <div
        className={`flex items-center gap-1.5 font-mono text-sm ${isPrev ? 'justify-end' : 'justify-start'}`}
      >
        <ComponentIcon icon={meta.icon} className="h-4 w-4" />
        {meta.component}
      </div>
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

function StepRail({
  index,
  onSelect,
  back,
}: {
  index: number;
  onSelect: (n: number) => void;
  back: boolean;
}) {
  const total = stepMeta.length;
  const prev = index > 1 ? stepMeta[index - 2] : null;
  const curr = stepMeta[index - 1];
  const next = index < total ? stepMeta[index] : null;

  return (
    <div className="flex items-center justify-center gap-10 px-10 py-5">
      <div className="flex w-[170px] justify-end">
        {prev && <NeighborStep meta={prev} side="prev" onClick={() => onSelect(index - 1)} />}
      </div>

      <div className="flex flex-col items-center text-center">
        {/* kropki — statyczne, bez animacji (aktywna linia tylko zmienia pozycję) */}
        <StepDots index={index} total={total} />

        {/* tytuł — wsuwa się z boku, bez zmiany przezroczystości */}
        <div
          key={index}
          className={`mt-3 flex flex-col items-center ${back ? 'sim-title-slide sim-title-slide--back' : 'sim-title-slide'}`}
        >
          <h2 className="font-heading text-3xl text-text-bright">{curr.title}</h2>
          <span className="mt-2 flex items-center gap-1.5 font-mono text-base text-text-muted">
            <ComponentIcon icon={curr.icon} className="h-4 w-4" />
            {curr.component}
          </span>
        </div>
      </div>

      <div className="flex w-[170px] justify-start">
        {next && <NeighborStep meta={next} side="next" onClick={() => onSelect(index + 1)} />}
      </div>
    </div>
  );
}

export default function SimShell({
  index,
  total,
  meta,
  onPrev,
  onNext,
  onSelect,
  onFinish,
  isAuto,
  onToggleAuto,
  children,
}: Props) {
  const text = useAppStore((s) => s.text);
  const usedFallback = useAppStore((s) => s.usedFallback);

  // Kierunek przejścia: dalej → wjazd z prawej, wstecz → z lewej.
  const prevIndexRef = useRef(index);
  const back = index < prevIndexRef.current;
  useEffect(() => {
    prevIndexRef.current = index;
  }, [index]);

  return (
    <div className="relative flex h-full flex-col">
      <TopBar />
      <StepRail index={index} onSelect={onSelect} back={back} />

      <EdgeArrow dir="left" onClick={onPrev} label="Poprzedni krok" disabled={index === 1} />
      <EdgeArrow dir="right" onClick={onNext} label="Następny krok" disabled={index === total} />

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
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-upper text-text-dim">
                  Krok {index} z {total} · {meta.component}
                </p>
                <h1 className="mt-1 font-heading text-2xl text-text-bright">{meta.title}</h1>
              </div>
              {text && (
                <span className="rounded-md border border-border bg-bg2 px-3 py-1.5 font-mono text-sm text-text-muted">
                  tekst: <span className="text-data-text">„{text}"</span>
                </span>
              )}
            </div>
            <div className="mt-8 flex-1">{children}</div>
          </div>
        </section>

        {/* prawa kolumna: model 3D (bez ramki, obracalny) + sam tekst na dole */}
        <aside className="flex min-h-0 flex-col">
          <div className="relative min-h-0 flex-1">
            <span className="absolute left-0 top-0 z-10 inline-flex items-center rounded-pill border border-accent/50 bg-accent/10 px-2.5 py-0.5 font-mono text-xs text-accent">
              Tu się to dzieje
            </span>
            <Scene modelUrl={`/models/${STEP_MODEL[meta.icon]}`} />
          </div>
          <div className="mt-4">
            <h2 className="font-heading text-lg text-text-bright">{meta.title}</h2>
            <p className="mt-2 font-ui text-base text-text-muted">{meta.description}</p>
          </div>
        </aside>
      </div>

      {/* dolny pasek */}
      <footer className="flex items-center justify-between border-t border-border px-6 py-3 font-ui text-sm">
        <div className="flex items-center gap-2 text-text-dim">
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">←</kbd>
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">→</kbd>
          <span>kroki</span>
          <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 font-mono text-xs">Spacja</kbd>
          <span>auto</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleAuto}
            className={[
              'rounded-md border px-4 py-2',
              isAuto
                ? 'border-accent text-accent'
                : 'border-border text-text-muted hover:text-text',
            ].join(' ')}
          >
            {isAuto ? '❚❚ Stop' : '▷ Auto'}
          </button>
          {index === total && (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-md bg-accent px-5 py-2 font-semibold text-bg hover:bg-accent-hover"
            >
              Zobacz podsumowanie →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
