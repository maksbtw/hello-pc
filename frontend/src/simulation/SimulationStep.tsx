import { useParams, useNavigate, Navigate } from 'react-router-dom';

import { useAppStore } from '../store/useAppStore';

/**
 * Krok symulacji — ZAŚLEPKA M1.
 * Na razie pokazuje numer kroku i surowe dane, żeby potwierdzić, że
 * nawigacja i dane ze store działają. Pełny widok (StepFrame + *StepView)
 * powstaje w M2/M3.
 */

const TOTAL = 7;

export default function SimulationStep() {
  const navigate = useNavigate();
  const { n } = useParams();
  const response = useAppStore((s) => s.response);

  // Wejście bez danych (np. odświeżenie na /step/3) → wracamy na start.
  if (!response) return <Navigate to="/simulation" replace />;

  const index = Number(n);
  if (!Number.isInteger(index) || index < 1 || index > TOTAL) {
    return <Navigate to="/simulation" replace />;
  }

  const step = response.steps[index - 1];

  return (
    <section className="mx-auto flex h-full max-w-3xl flex-col p-8">
      <p className="font-mono text-sm text-text-dim">
        Krok {index}/{TOTAL}
      </p>
      <h1 className="mt-1 font-heading text-xl text-text-bright">{step.id}</h1>

      <pre className="mt-6 flex-1 overflow-auto rounded-md border border-border bg-surface p-4 font-mono text-sm text-data-text">
        {JSON.stringify(step, null, 2)}
      </pre>

      <div className="mt-6 flex justify-between font-ui text-sm">
        <button
          onClick={() => (index > 1 ? navigate(`/simulation/step/${index - 1}`) : navigate('/simulation'))}
          className="rounded-md border border-border px-5 py-2 text-text-muted hover:border-border-strong hover:text-text"
        >
          Wstecz
        </button>
        <button
          onClick={() =>
            index < TOTAL ? navigate(`/simulation/step/${index + 1}`) : navigate('/simulation/done')
          }
          className="rounded-md bg-accent px-5 py-2 font-semibold text-bg hover:bg-accent-hover"
        >
          {index < TOTAL ? 'Dalej' : 'Zakończ'}
        </button>
      </div>
    </section>
  );
}
