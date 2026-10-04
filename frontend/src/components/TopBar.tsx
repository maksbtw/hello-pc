import { Link, useLocation } from 'react-router-dom';

/**
 * Globalny nagłówek aplikacji: gwiazdka (akcent) + nazwa „PC Workshop" po lewej,
 * przełącznik trybu Demo / Symulacja po prawej. Renderowany raz w App, nad
 * wszystkimi trasami — widoczny na każdym ekranie. Logo linkuje do startu (/).
 */

const MODES: { label: string; to: string; match: string }[] = [
  { label: 'Demo', to: '/explore', match: '/explore' },
  { label: 'Symulacja', to: '/simulation', match: '/simulation' },
];

function ModeSwitch() {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {MODES.map((m) => {
        const active = pathname === m.match || pathname.startsWith(`${m.match}/`);
        return (
          <Link
            key={m.to}
            to={m.to}
            aria-current={active ? 'page' : undefined}
            className={`rounded-md px-4 py-1.5 font-ui text-sm transition-colors ${
              active ? 'bg-accent font-medium text-bg' : 'text-text-muted hover:text-text'
            }`}
          >
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function TopBar() {
  return (
    <header className="flex flex-none items-center justify-between px-6 py-3">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-accent">✦</span>
        <span className="font-heading text-md text-text-bright">PC Workshop</span>
      </Link>
      <ModeSwitch />
    </header>
  );
}
