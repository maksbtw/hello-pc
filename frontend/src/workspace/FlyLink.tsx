import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

export default function FlyLink({
  to,
  children,
  variant = 'primary',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const Arrow = useFlyArrow(to);
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
