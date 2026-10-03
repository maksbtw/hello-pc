import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ExploreScene from './three/ExploreScene';
import { useAppStore } from './store/useAppStore';
import { parts } from './data/parts';

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
        background:
          'radial-gradient(60% 40% at 50% 0%, rgba(255,217,160,0.18), transparent 70%), ' +
          'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
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
      <nav className="mt-6 flex flex-wrap gap-4 font-ui text-sm text-accent">
        <Link to="/">/</Link>
        <Link to="/explore">/explore</Link>
        <Link to="/simulation">/simulation</Link>
        <Link to="/simulation/step/1">/simulation/step/1</Link>
        <Link to="/simulation/done">/simulation/done</Link>
      </nav>
    </section>
  );
}

// --- Eksploracja: scena 3D (Max). Panel boczny dojdzie w kroku 7. ---
function Explore() {
  const selectedPart = useAppStore((s) => s.selectedPart);

  return (
    <div className="relative h-full w-full">
      <ExploreScene />
      <nav className="absolute left-4 top-4 flex gap-4 font-ui text-sm text-accent">
        <Link to="/">← Start</Link>
      </nav>

      {/* Tymczasowy readout zaznaczonej części (krok 4). Panel = krok 7. */}
      <div className="absolute right-4 top-4 min-w-48 rounded-lg border border-border bg-panel/80 p-4 backdrop-blur">
        <p className="font-ui text-xs uppercase tracking-wide text-text-faint">Zaznaczona część</p>
        <p className="mt-1 font-heading text-lg text-text">
          {selectedPart ? parts[selectedPart].title : '—'}
        </p>
        {!selectedPart && (
          <p className="mt-1 font-ui text-xs text-text-muted">Kliknij część w scenie</p>
        )}
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-ui text-xs text-text-faint">
        Przeciągnij, aby obrócić • scroll = zoom
      </p>
    </div>
  );
}

export default function App() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative h-full">
      <LampBackground />
      {!isDesktop ? (
        <SmallScreenGate />
      ) : (
        <Routes>
          <Route path="/" element={<Placeholder title="PC Workshop" owner="start: wybór poziomu + 2 przyciski" />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/simulation" element={<Placeholder title="Symulacja" owner="Anton: pole tekstu, licznik 12 znaków" />} />
          <Route path="/simulation/step/:n" element={<Placeholder title="Krok symulacji" owner="Anton: stepper, karta PRZED→PO" />} />
          <Route path="/simulation/done" element={<Placeholder title="Finał" owner="Anton: ekran końcowy" />} />
          <Route path="*" element={<Placeholder title="404" owner="nieznana trasa" />} />
        </Routes>
      )}
    </div>
  );
}
