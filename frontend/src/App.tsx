import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ExploreScene from './three/ExploreScene';
import PartPanel from './explore/PartPanel';
import Lamp from './explore/Lamp';

import SimulationEntry from './simulation/SimulationEntry';
import SimulationStep from './simulation/SimulationStep';
import SimulationDone from './simulation/SimulationDone';

import TopBar from './components/TopBar';

/**
 * Szkielet aplikacji: bramka szerokości ekranu, tło "lampa" i trasy-placeholdery.
 * Każdy członek zespołu rozbudowuje swoją część — tu jest tylko miejsce startowe.
 */

// --- Tło "lampa": ciepłe światło u góry + winieta na krawędziach ---
function LampBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // Cold lamp glow from the top, a faint PCB dot grid (gives the glass
        // something to blur) and a vignette on the edges.
        background:
          'radial-gradient(60% 40% at 50% 0%, rgb(var(--lamp-rgb) / 0.1), transparent 70%), ' +
          'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.55) 100%), ' +
          'radial-gradient(rgb(var(--accent-ink-rgb) / 0.07) 1px, transparent 1px) 0 0 / 22px 22px',
      }}
    />
  );
}

// --- Bramka: aplikacja działa od 1280 px ---
function useIsDesktop() {
  const [ok, setOk] = useState(() => window.innerWidth >= 1280);
  useEffect(() => {
    const onResize = () => setOk(window.innerWidth >= 1280);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return ok;
}

function SmallScreenGate() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <p className="max-w-md font-ui text-lg text-text-muted">
        Otwórz na komputerze — PC Workshop działa na ekranach od 1280 px.
      </p>
    </div>
  );
}

// --- Placeholder trasy (owner rozbuduje) ---
function Placeholder({ title, owner }: { title: string; owner: string }) {
  return (
    <section className="p-8">
      <h1 className="font-heading text-3xl text-text">{title}</h1>
      <p className="mt-2 font-ui text-sm text-text-faint">TODO — {owner}</p>
      <nav className="mt-6 flex flex-wrap gap-4 font-ui text-sm text-accent-ink">
        <Link to="/explore">/explore</Link>
        <Link to="/simulation">/simulation</Link>
      </nav>
    </section>
  );
}

// --- Eksploracja: scena 3D (Max) + panel boczny. ---
function Explore() {
  return (
    <div className="relative h-full w-full">
      {/* Canvas kończy się przed panelem (360px + 16px margines + 16px odstęp),
          żeby model był wyśrodkowany w widocznym obszarze, nie pod panelem. */}
      <div className="absolute inset-y-0 left-0 right-[392px]">
        {/* Lampa scenowa (wg Figmy) — za przezroczystym Canvasem, oświetla model. */}
        <Lamp />
        <ExploreScene />
      </div>
      <PartPanel />
    </div>
  );
}

export default function App() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative flex h-full flex-col">
      <LampBackground />
      {!isDesktop ? (
        <SmallScreenGate />
      ) : (
        <>
          {/* Globalny nagłówek — widoczny na każdej trasie. */}
          <TopBar />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/explore" replace />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/simulation" element={<SimulationEntry />} />
              <Route path="/simulation/step/:n" element={<SimulationStep />} />
              <Route path="/simulation/done" element={<SimulationDone />} />
              <Route path="*" element={<Placeholder title="404" owner="nieznana trasa" />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}
