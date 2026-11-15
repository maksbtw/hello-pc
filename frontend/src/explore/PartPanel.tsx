import type { ReactNode } from 'react';
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
            level === l.id ? 'bg-accent font-medium text-accent-on shadow-edge' : 'text-text-muted hover:text-text'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// --- Ikony akcji (inline SVG, offline, dziedziczą currentColor) ---
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}
function ClickIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 17 2.51-7.39L20 10.09 3 3z" />
    </svg>
  );
}
function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function ActionRow({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <li className="glass-inner flex items-center gap-3 rounded-lg px-3 py-2.5 text-left">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-accent text-accent-ink shadow-edge">
        {icon}
      </span>
      <span className="font-ui text-sm leading-snug">
        <span className="font-medium text-text">{title}</span>{' '}
        <span className="text-text-muted">— {desc}</span>
      </span>
    </li>
  );
}

function IdlePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center glass-inner rounded-lg text-accent-ink">
        <BoxIcon />
      </div>
      <h2 className="mt-4 font-heading text-xl text-text">Eksploracja</h2>
      <p className="mt-2 max-w-[260px] font-ui text-sm leading-relaxed text-text-muted">
        Poznaj podzespoły komputera — wybierz część, aby ją wysunąć i zobaczyć szczegóły.
      </p>
      <ul className="mt-6 w-full space-y-2">
        <ActionRow icon={<ClickIcon />} title="Kliknij część" desc="wysuwa ją i otwiera opis" />
        <ActionRow icon={<RotateIcon />} title="Przeciągnij" desc="obraca scenę 3D" />
        <ActionRow icon={<ZoomIcon />} title="Scroll" desc="przybliża i oddala" />
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

      </div>
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
