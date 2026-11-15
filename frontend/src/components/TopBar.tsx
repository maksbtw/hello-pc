import { useLocation } from 'react-router-dom';
import { pointFor } from '../workspace/points';
import FlyLink from '../workspace/FlyLink';

/**
 * Global header: a floating glass pill in the top-right corner with the ways out of the
 * current window. The buttons change with the window (each point lists its `exits`), and
 * every arrow points where the camera will fly. The row keeps its height even when a
 * window has no exits, so content never jumps.
 */
export default function TopBar() {
  const { pathname } = useLocation();
  const exits = pointFor(pathname)?.exits ?? [];

  return (
    <header className="relative z-20 mx-4 mt-3 flex h-14 flex-none items-center justify-end">
      {exits.length > 0 && (
        <nav className="glass flex gap-1.5 rounded-pill p-1.5" aria-label="Nawigacja">
          {exits.map((exit) => (
            <FlyLink key={exit.to} to={exit.to} variant="nav">
              {exit.label}
            </FlyLink>
          ))}
        </nav>
      )}
    </header>
  );
}
