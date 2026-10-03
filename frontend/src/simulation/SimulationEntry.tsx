import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { postSimulation } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import Lamp, { type LampStatus } from './Lamp';
import './simulation.css';

/**
 * Ekran wejścia symulacji (Anton, M1).
 * Użytkownik wpisuje krótki tekst (max 12 code pointów), klika „Wyślij".
 * Podczas liczenia lampa u góry miga, po załadowaniu zapala się na ~1 s,
 * potem przejście do kroku 1.
 */

const MAX = 12;

// Jak długo lampa jest zgaszona po wysłaniu (minimum), i jak długo świeci przed skokiem.
const OFF_MS = 1200;
const ON_MS = 1000;

export default function SimulationEntry() {
  const navigate = useNavigate();
  const setResponse = useAppStore((s) => s.setResponse);
  const setText = useAppStore((s) => s.setText);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<LampStatus>('idle');

  // Liczymy code pointy, nie .length — "👋" to 1 znak, ale 2 jednostki UTF-16.
  const count = [...value].length;
  const canSubmit = count > 0 && count <= MAX && status === 'idle';

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    // Twardy limit: obcinamy do MAX code pointów (również przy wklejaniu).
    const clipped = [...e.target.value].slice(0, MAX).join('');
    setValue(clipped);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Lampa gaśnie — sygnał "poszło".
    setStatus('off');
    const t0 = Date.now();

    const { data } = await postSimulation(value);
    setText(value);
    setResponse(data);
    setCurrentStep(1);

    // Trzymaj zgaszone min. OFF_MS, potem zapal i po ON_MS wejdź w krok 1.
    const wait = Math.max(0, OFF_MS - (Date.now() - t0));
    window.setTimeout(() => {
      setStatus('on');
      window.setTimeout(() => navigate('/simulation/step/1'), ON_MS);
    }, wait);
  }

  const busy = status !== 'idle';

  return (
    <div className="relative flex h-full">
      {/* lewa: tekst + formularz */}
      <div className="flex w-1/2 flex-col justify-center px-16">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-h2 text-text-bright">Wyślij tekst przez komputer</h1>

          <p className="mt-4 font-ui text-md text-text-muted">
            Wpisz krótki tekst i zobacz, co dzieje się z nim w środku komputera — krok po kroku, od
            klawisza aż po piksele na ekranie.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex w-full flex-col gap-3">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              disabled={busy}
              placeholder="np. Hello"
              autoFocus
              spellCheck={false}
              aria-label="Tekst do symulacji"
              className="w-full rounded-md border border-border bg-surface px-5 py-4 font-mono text-xl text-text placeholder:text-text-faint focus:border-accent focus:outline-none disabled:opacity-60"
            />

            <div className="flex w-full items-center justify-between font-mono text-sm text-text-dim">
              <span>{busy ? 'przetwarzam…' : 'maks. 12 znaków'}</span>
              <span className={count === MAX ? 'text-accent' : ''}>
                {count}/{MAX}
              </span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 self-start rounded-md bg-accent px-8 py-3 font-ui font-semibold text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'idle' ? 'Wyślij' : status === 'off' ? 'Wysyłam…' : 'Gotowe'}
            </button>
          </form>
        </div>
      </div>

      {/* prawa: lampa */}
      <div className="relative w-1/2">
        <Lamp status={status} />
      </div>
    </div>
  );
}
