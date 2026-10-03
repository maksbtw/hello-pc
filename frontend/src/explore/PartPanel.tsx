import { useAppStore } from '../store/useAppStore';
import { parts } from '../data/parts';
import type { Level } from '../types/api';

/**
 * Panel boczny eksploracji (Max). Czyta selectedPart ze store i pokazuje opis
 * części na wybranym poziomie (noob/expert). Sekcja „Zapytaj o tę część"
 * to slot pod integrację AI (Anton → /api/ask) — tu tylko szkielet UI.
 */

const LEVELS: { id: Level; label: string }[] = [
  { id: 'noob', label: 'Podstawy' },
  { id: 'expert', label: 'Ekspert' },
];

function LevelSwitch() {
  const level = useAppStore((s) => s.level);
  const setLevel = useAppStore((s) => s.setLevel);
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {LEVELS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLevel(l.id)}
          className={`flex-1 rounded-md px-3 py-1.5 font-ui text-xs transition-colors ${
            level === l.id
              ? 'bg-accent font-medium text-bg'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function IdlePanel() {
  return (
    <div className="flex h-full flex-col justify-center">
      <h2 className="font-heading text-xl text-text">Eksploracja</h2>
      <p className="mt-2 font-ui text-sm leading-relaxed text-text-muted">
        Kliknij część w scenie 3D (CPU, GPU, RAM, SSD…), aby ją wysunąć i poznać
        szczegóły. Obracaj scenę przeciągając, przybliżaj scrollem.
      </p>
    </div>
  );
}

export default function PartPanel() {
  const selectedPart = useAppStore((s) => s.selectedPart);
  const level = useAppStore((s) => s.level);
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);

  return (
    <aside className="absolute right-4 top-4 bottom-4 flex w-[360px] flex-col overflow-hidden rounded-xl border border-border bg-panel/85 backdrop-blur">
      {!selectedPart ? (
        <div className="p-6">
          <IdlePanel />
        </div>
      ) : (
        <>
          {/* Nagłówek */}
          <header className="flex items-start justify-between gap-3 border-b border-border p-6">
            <div>
              <p className="font-ui text-xs uppercase tracking-wide text-text-faint">
                Komponent
              </p>
              <h2 className="mt-1 font-heading text-2xl text-text">
                {parts[selectedPart].title}
              </h2>
            </div>
            <button
              onClick={() => setSelectedPart(null)}
              aria-label="Zamknij"
              className="rounded-md px-2 py-1 font-ui text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
            >
              ✕
            </button>
          </header>

          {/* Treść (scroll) */}
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <LevelSwitch />

            <section>
              <p className="font-ui text-sm leading-relaxed text-text">
                {parts[selectedPart].description[level] === 'TODO' ? (
                  <span className="text-text-faint">
                    Opis na poziomie „{LEVELS.find((l) => l.id === level)?.label}" w
                    przygotowaniu.
                  </span>
                ) : (
                  parts[selectedPart].description[level]
                )}
              </p>
            </section>

            {/* Slot AI — integracja: Anton (/api/ask) */}
            <section className="rounded-lg border border-border bg-surface/60 p-4">
              <p className="font-ui text-xs uppercase tracking-wide text-text-faint">
                Zapytaj o tę część
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  disabled
                  placeholder="np. po co mu chłodzenie?"
                  className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 font-ui text-sm text-text placeholder:text-text-faint disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  disabled
                  className="rounded-md bg-accent px-3 py-2 font-ui text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Zapytaj
                </button>
              </div>
              <p className="mt-2 font-ui text-xs text-text-faint">
                AI (lokalne) — integracja w toku.
              </p>
            </section>
          </div>
        </>
      )}
    </aside>
  );
}
