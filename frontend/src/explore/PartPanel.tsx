import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { parts } from '../data/parts';
import type { PartName } from '../data/parts';
import type { Level } from '../types/api';
import { ASSEMBLY_PARTS, getCachedCatalog, getVariantModels } from '../three/catalog';
import FlyLink from '../workspace/FlyLink';
import { journeyPath } from '../workspace/journeys';

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
            level === l.id ? 'bg-accent font-medium text-accent-on shadow-edge' : 'text-text-muted hover:text-text'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Small section heading inside the panel (sentence case, readable contrast). */
function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 font-heading text-sm text-text-dim">{children}</h3>;
}

/**
 * Nothing selected: the same parts you can click on the model, as a list. This is also
 * the keyboard way in (the 3D scene itself only takes a mouse).
 */
function IdlePanel() {
  const setSelectedPart = useAppStore((s) => s.setSelectedPart);
  return (
    <div className="flex h-full flex-col">
      <h2 className="font-heading text-2xl text-text">Wybierz część</h2>
      <p className="mt-2 font-ui text-sm leading-relaxed text-text-muted">
        Kliknij część na modelu albo wybierz ją z listy. Przeciągnij, żeby obrócić scenę, i
        przewiń, żeby ją przybliżyć.
      </p>
      <ul className="mt-6 border-b border-border" aria-label="Części komputera">
        {ASSEMBLY_PARTS.map((part) => (
          <li key={part} className="border-t border-border">
            <button
              type="button"
              data-part-button={part}
              onClick={() => setSelectedPart(part)}
              className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left font-ui text-base text-text transition-colors hover:bg-surface/60 hover:text-text-bright"
            >
              <span>{parts[part].title}</span>
              <ChevronRight
                size={18}
                strokeWidth={1.8}
                className="flex-none text-text-dim transition-colors group-hover:text-accent-ink"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
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

  // Opening a part moves focus to its title, so keyboard and screen-reader users land in
  // the new content. Closing puts focus back on that part in the list.
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [part]);
  const close = () => {
    setSelectedPart(null);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-part-button="${part}"]`)?.focus(),
    );
  };

  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-border p-6">
        <div>
          <h2
            ref={titleRef}
            tabIndex={-1}
            className="font-heading text-2xl text-text focus:outline-none"
          >
            {parts[part].title}
          </h2>
          <p className="mt-1 font-ui text-sm text-text-muted">{parts[part].tagline}</p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Zamknij i wróć do listy części"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
        >
          <X size={18} strokeWidth={1.8} aria-hidden />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <LevelSwitch />

        {hasVariantRow && (
          <section>
            <SectionTitle>Warianty</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {variantModels.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setFocusedVariant(v.id)}
                  className={`rounded-md border px-3 py-1.5 font-ui text-xs transition-colors ${
                    v.id === focusId
                      ? 'border-accent-ink/40 bg-accent font-medium text-accent-on'
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
          <SectionTitle>W skrócie</SectionTitle>
          <ul className="space-y-1.5">
            {facts.map((fact, i) => (
              <li key={i} className="flex gap-2 font-ui text-sm text-text-muted">
                <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-ink" aria-hidden />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {parameters && Object.keys(parameters).length > 0 && (
          <section>
            <SectionTitle>Parametry</SectionTitle>
            <dl className="space-y-1.5">
              {Object.entries(parameters).map(([k, v]) => (
                <div key={k} className="flex gap-3 font-ui text-sm">
                  <dt className="w-32 flex-none text-text-dim">{k}</dt>
                  <dd className="text-text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

      </div>

      {/* Way out of the panel: this part's own journey, in the row under the PC. */}
      <footer className="border-t border-border p-4">
        <FlyLink to={journeyPath(part)} className="w-full">
          Pokaż podróż
        </FlyLink>
      </footer>
    </>
  );
}

export default function PartPanel() {
  const selectedPart = useAppStore((s) => s.selectedPart);

  return (
    <aside className="absolute right-4 top-4 bottom-4 flex w-[360px] flex-col overflow-hidden glass rounded-xl">
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
