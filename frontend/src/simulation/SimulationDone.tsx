import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store/useAppStore';

/**
 * Ekran finałowy — ZAŚLEPKA M1.
 * Pełne podsumowanie podróży danych powstaje w M2.
 */

export default function SimulationDone() {
  const navigate = useNavigate();
  const text = useAppStore((s) => s.text);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="font-heading text-h2 text-text-bright">Gotowe</h1>
      <p className="max-w-md font-ui text-md text-text-muted">
        Twój tekst {text ? <span className="font-mono text-accent-ink">„{text}"</span> : null} przebył
        całą drogę przez komputer — od klawisza po piksele.
      </p>

      <div className="mt-2 flex gap-4 font-ui text-sm">
        <button
          onClick={() => navigate('/simulation')}
          className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-on shadow-edge hover:bg-accent-bright"
        >
          Spróbuj ponownie
        </button>
        <button
          onClick={() => navigate('/explore')}
          className="glass-inner rounded-md px-6 py-3 text-text-muted hover:text-text"
        >
          Przejdź do Demo
        </button>
      </div>
    </div>
  );
}
