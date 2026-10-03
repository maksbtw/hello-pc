import { useAppStore } from '../store/useAppStore';
import { parts } from '../data/parts';
import type { PartName } from '../data/parts';
import type { Level } from '../types/api';
import { getCachedCatalog, getVariantModels } from '../three/catalog';

/**
 * Panel boczny eksploracji (Max). Czyta selectedPart ze store i pokazuje opis
 * części na poziomie noob/expert. Dla części z wariantami 3D (CPU, GPU, RAM,
 * dysk, płyta) dochodzą chipy wariantów — klik podświetla model w rzędzie i
 * pokazuje jego opis + fakty + parametry. „Zapytaj o tę część" to slot AI (Anton).
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
            level === l.id ? 'bg-accent font-medium text-bg' : 'text-text-muted hover:text-text'
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

function SelectedPanel({ part }: { part: PartName }) {
  const level = useAppStore((s) => s.level);
  const focusedVariant = useAppStore((s) => s.focusedVariant);
  const setFocusedVariant = useAppStore((s) => s.setFocusedVariant);
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);

  const data = getCachedCatalog();
  const variantModels = data ? getVariantModels(data, part) : [];
  const hasVariantRow = variantModels.length >= 2;

  // Przy braku jawnego wyboru pierwszy wariant jest domyślnie wyróżniony.
  const focusId = focusedVariant ?? variantModels[0]?.id ?? null;
  const activeType = hasVariantRow
    ? parts[part].types.find((t) => t.id === focusId)
    : undefined;

  const description = activeType ? activeType.description[level] : parts[part].description[level];
  const facts = activeType ? activeType.facts : parts[part].facts;
  const parameters = activeType?.parameters ?? null;

  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-border p-6">
        <div>
          <p className="font-ui text-xs uppercase tracking-wide text-text-faint">Komponent</p>
          <h2 className="mt-1 font-heading text-2xl text-text">{parts[part].title}</h2>
          <p className="mt-1 font-ui text-sm text-text-muted">{parts[part].tagline}</p>
        </div>
        <button
          onClick={() => setSelectedPart(null)}
          aria-label="Zamknij"
          className="rounded-md px-2 py-1 font-ui text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <LevelSwitch />

        {hasVariantRow && (
          <section>
            <p className="mb-2 font-ui text-xs uppercase tracking-wide text-text-faint">
              Warianty
            </p>
            <div className="flex flex-wrap gap-2">
              {variantModels.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setFocusedVariant(v.id)}
                  className={`rounded-md border px-3 py-1.5 font-ui text-xs transition-colors ${
                    v.id === focusId
                      ? 'border-accent bg-accent font-medium text-bg'
                      : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          {activeType && (
            <p className="mb-1 font-heading text-base text-text">{activeType.name}</p>
          )}
          <p className="font-ui text-sm leading-relaxed text-text">{description}</p>
        </section>

        <section>
          <p className="mb-2 font-ui text-xs uppercase tracking-wide text-text-faint">W skrócie</p>
          <ul className="space-y-1.5">
            {facts.map((fact, i) => (
              <li key={i} className="flex gap-2 font-ui text-sm text-text-muted">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-accent" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {parameters && Object.keys(parameters).length > 0 && (
          <section>
            <p className="mb-2 font-ui text-xs uppercase tracking-wide text-text-faint">
              Parametry
            </p>
            <dl className="space-y-1.5">
              {Object.entries(parameters).map(([k, v]) => (
                <div key={k} className="flex gap-3 font-ui text-sm">
                  <dt className="w-32 flex-none text-text-faint">{k}</dt>
                  <dd className="text-text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

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
          <p className="mt-2 font-ui text-xs text-text-faint">AI (lokalne) — integracja w toku.</p>
        </section>
      </div>
    </>
  );
}

export default function PartPanel() {
  const selectedPart = useAppStore((s) => s.selectedPart);

  return (
    <aside className="absolute right-4 top-4 bottom-4 flex w-[360px] flex-col overflow-hidden rounded-xl border border-border bg-panel/85 backdrop-blur">
      {selectedPart ? (
        <SelectedPanel part={selectedPart} />
      ) : (
        <div className="p-6">
          <IdlePanel />
        </div>
      )}
    </aside>
  );
}
