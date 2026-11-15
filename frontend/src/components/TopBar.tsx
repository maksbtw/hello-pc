import { Link, useLocation } from 'react-router-dom';
import { Boxes, Cpu, Route, type LucideIcon } from 'lucide-react';

/**
 * Global header: a floating glass bar with the brand tile on the left and the
 * mode switch (pill dock) on the right. Rendered once in App above all routes.
 */

const MODES: { label: string; to: string; match: string; icon: LucideIcon }[] = [
  { label: 'Demo', to: '/explore', match: '/explore', icon: Boxes },
  { label: 'Symulacja', to: '/simulation', match: '/simulation', icon: Route },
];

function ModeSwitch() {
  const { pathname } = useLocation();
  return (
    <nav className="glass-inner flex gap-1 rounded-pill p-1" aria-label="Tryb">
      {MODES.map((m) => {
        const active = pathname === m.match || pathname.startsWith(`${m.match}/`);
        const Icon = m.icon;
        return (
          <Link
            key={m.to}
            to={m.to}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-pill px-4 py-1.5 font-ui text-sm transition-colors ${
              active
                ? 'bg-accent font-medium text-accent-on shadow-edge'
                : 'text-text-muted hover:bg-surface-overlay/60 hover:text-text'
            }`}
          >
            <Icon size={15} strokeWidth={1.8} aria-hidden />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function TopBar() {
  return (
    <header className="glass relative z-20 mx-4 mt-3 flex h-14 flex-none items-center justify-between rounded-xl pl-3 pr-2">
      <Link to="/" className="flex items-center gap-2.5 rounded-md">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on shadow-edge">
          <Cpu size={17} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="font-heading text-md text-text-bright">PC Workshop</span>
      </Link>
      <ModeSwitch />
    </header>
  );
}
