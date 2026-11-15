import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import Workspace from './workspace/Workspace';

/**
 * App shell: screen-width gate, the fixed lamp background, the top bar and the workspace.
 * All routing lives in the workspace (see src/workspace/points.tsx).
 */

// --- Lamp background: cold light from the top + vignette. Fixed: it doesn't move with
//     the camera. (The PCB dot grid is the table texture inside the workspace.) ---
function LampBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(60% 40% at 50% 0%, rgb(var(--lamp-rgb) / 0.1), transparent 70%), ' +
          'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.55) 100%)',
      }}
    />
  );
}

// --- Gate: the app needs at least 1280 px ---
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

export default function App() {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative flex h-full flex-col">
      <LampBackground />
      {!isDesktop ? (
        <SmallScreenGate />
      ) : (
        <>
          {/* Global header: fixed above the table, visible on every point. */}
          <TopBar />
          <div className="relative min-h-0 flex-1">
            <Workspace />
          </div>
        </>
      )}
    </div>
  );
}
