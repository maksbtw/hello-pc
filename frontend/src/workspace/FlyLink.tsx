import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { pointFor } from './points';

/**
 * A link to another point whose arrow points where the camera will fly. Inside a cell,
 * useLocation() is that cell's own URL, so the arrow is always relative to this window.
 */

const ARROWS: Record<string, LucideIcon> = {
  '0,1': ArrowUp,
  '0,-1': ArrowDown,
  '-1,0': ArrowLeft,
  '1,0': ArrowRight,
  '1,1': ArrowUpRight,
  '-1,1': ArrowUpLeft,
  '1,-1': ArrowDownRight,
  '-1,-1': ArrowDownLeft,
};

/** Arrow icon for the direction from the current point to `to` (null if same point). */
function useFlyArrow(to: string): LucideIcon | null {
  const { pathname } = useLocation();
  const from = pointFor(pathname);
  const target = pointFor(to);
  if (!from || !target || from === target) return null;
  const dx = Math.sign(target.pos[0] - from.pos[0]);
  const dy = Math.sign(target.pos[1] - from.pos[1]);
  return ARROWS[`${dx},${dy}`] ?? null;
}

const VARIANTS = {
  primary:
    'bg-accent text-accent-on shadow-edge hover:bg-accent-bright px-6 py-3 text-base font-medium',
  glass: 'glass text-text hover:text-text-bright px-5 py-2.5 text-sm',
  /** For the window nav (top right). */
  nav: 'bg-accent px-5 py-2.5 text-base font-medium text-accent-on shadow-edge hover:bg-accent-bright',
};

type Props = {
  to: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS | 'key';
  className?: string;
};

export default function FlyLink({ to, children, variant = 'primary', className = '' }: Props) {
  const Arrow = useFlyArrow(to);
  if (variant === 'key') {
    return (
      <KeycapLink to={to} Arrow={Arrow} className={className}>
        {children}
      </KeycapLink>
    );
  }
  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2 rounded-pill font-ui transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
      {Arrow && <Arrow size={17} strokeWidth={1.8} aria-hidden />}
    </Link>
  );
}

/**
 * A physical keycap (see .keycap in index.css): the top face sinks on hover and bottoms
 * out on press. It's also an Enter key: pressing Enter while its window is the current
 * one presses the cap visibly, then flies. Only one keycap per window should exist.
 */
function KeycapLink({
  to,
  Arrow,
  className,
  children,
}: {
  to: string;
  Arrow: LucideIcon | null;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pressed = useEnterToFly(ref, to);

  return (
    <Link
      ref={ref}
      to={to}
      className={`keycap font-ui ${className}`}
      data-pressed={pressed ? '' : undefined}
      aria-keyshortcuts="Enter"
    >
      <span className="keycap-body">
        <span className="keycap-top">
          <span className="text-lg font-medium">{children}</span>
          {Arrow && <Arrow size={19} strokeWidth={1.9} aria-hidden />}
        </span>
      </span>
    </Link>
  );
}

/**
 * Enter flies to `to`: the key looks pressed (returned flag) for a moment first. Ignored
 * while typing, and while the link's window is inert (off-screen or mid-flight).
 */
export function useEnterToFly(ref: RefObject<HTMLElement>, to: string) {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const onDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = ref.current;
      // Not while typing somewhere, and not while this window is off-screen or in flight.
      const t = e.target as HTMLElement | null;
      if (!el || el.closest('[inert]') || t?.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault(); // we navigate ourselves, after the press is visible
      setPressed(true);
      timer = window.setTimeout(() => navigate(to), 140);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'Enter') setPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.clearTimeout(timer);
    };
  }, [navigate, ref, to]);

  return pressed;
}
