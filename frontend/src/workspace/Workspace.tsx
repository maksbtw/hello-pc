import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Route, Routes, useLocation, type Location } from 'react-router-dom';
import { POINTS, pointFor, type Point } from './points';
import {
  bgPosition,
  cameraTransform,
  cellStyle,
  durationFor,
  EASING,
  isPassedBy,
  type Vec,
} from './geometry';
import NotFound from '../points/NotFound';
import './workspace.css';

/**
 * "Camera over a table" navigation (design: Maksym's prototype, ported from Next.js).
 *
 * Every URL is a fixed point on one big table; a URL change flies the camera there in a
 * straight line. The camera only pans, never stops halfway and can't be dragged. Mounted
 * once in App, so it never remounts on navigation.
 */

type Flight = {
  from: Point;
  to: Point;
  passed: Point[];
  /** Each end keeps the URL it had, so e.g. a simulation step stays on screen while leaving. */
  fromLocation: Location;
  toLocation: Location;
};

export default function Workspace() {
  const location = useLocation();
  const target = pointFor(location.pathname); // undefined → unknown URL: camera stays, 404 on top

  // Opening a URL directly (or reloading) starts on that point, no animation.
  const [settled, setSettled] = useState<Point>(() => target ?? POINTS[0]);
  const [flight, setFlight] = useState<Flight | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const focusOnLand = useRef(false);
  /** Last URL seen while standing on `settled`. */
  const settledLocation = useRef(location);

  useEffect(() => {
    if (!flight && target === settled) settledLocation.current = location;
  }, [flight, target, settled, location]);

  // 1) URL points elsewhere → plan a flight. While one is in the air we wait: the camera
  //    never stops mid-way. On landing this re-runs and flies to whatever the URL is *now*,
  //    so spamming links/back only ever goes to the latest destination (no queue).
  useEffect(() => {
    if (flight || !target || target === settled) return;
    const passed = POINTS.filter(
      (p) => p !== settled && p !== target && isPassedBy(settled.pos, target.pos, p.pos),
    );
    setFlight({
      from: settled,
      to: target,
      passed,
      fromLocation: settledLocation.current,
      toLocation: location,
    });
  }, [target, settled, flight, location]);

  // 2) Flight planned → both ends + skeletons are mounted. Wait two frames so the
  //    destination's first paint doesn't compete with the animation, then move.
  useLayoutEffect(() => {
    if (!flight) return;
    const root = rootRef.current!;
    const world = worldRef.current!;
    const { from, to } = flight;
    let cancelled = false;
    const anims: Animation[] = [];

    const land = () => {
      if (cancelled) return;
      world.style.transform = cameraTransform(to.pos);
      root.style.backgroundPosition = bgPosition(to.pos, root);
      settledLocation.current = flight.toLocation;
      focusOnLand.current = true;
      setSettled(to);
      setFlight(null);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      land();
      return () => void (cancelled = true);
    }

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        const opts: KeyframeAnimationOptions = {
          duration: durationFor(from.pos, to.pos),
          easing: EASING,
          fill: 'forwards',
        };
        anims.push(
          world.animate(
            [{ transform: cameraTransform(from.pos) }, { transform: cameraTransform(to.pos) }],
            opts,
          ),
          // The table texture slides in sync, so empty cells feel like the same surface.
          root.animate(
            [
              { backgroundPosition: bgPosition(from.pos, root) },
              { backgroundPosition: bgPosition(to.pos, root) },
            ],
            opts,
          ),
        );
        anims[0].finished.then(
          () => {
            land();
            anims.forEach((a) => a.cancel()); // inline styles from land() take over
          },
          () => {},
        );
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      anims.forEach((a) => a.cancel());
    };
  }, [flight]);

  // After landing (not on first load), move keyboard/screen-reader focus to the new point.
  useEffect(() => {
    if (flight || !focusOnLand.current) return;
    focusOnLand.current = false;
    cellRefs.current.get(settled.path)?.focus({ preventScroll: true });
  }, [settled, flight]);

  // Keep the texture aligned after resizes (the transform uses %, so it needs nothing).
  useEffect(() => {
    const root = rootRef.current!;
    const sync = () => {
      if (!flight) root.style.backgroundPosition = bgPosition(settled.pos, root);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [settled, flight]);

  const live: [Point, Location][] = flight
    ? [
        [flight.from, flight.fromLocation],
        [flight.to, flight.toLocation],
      ]
    : [[settled, target === settled ? location : settledLocation.current]];
  const camera = flight ? flight.from.pos : settled.pos;

  return (
    <div ref={rootRef} className="ws-root" data-moving={flight ? '' : undefined}>
      <div ref={worldRef} className="ws-world" style={{ transform: cameraTransform(camera) }}>
        {flight?.passed.map((p) => (
          <Cell key={`skeleton:${p.path}`} pos={p.pos} inert>
            <p.Skeleton />
          </Cell>
        ))}
        {live.map(([p, loc]) => (
          <Cell
            key={p.path}
            pos={p.pos}
            // Only the point you're standing on is interactive.
            inert={!!flight}
            focusable
            cellRef={(el) => {
              if (el) cellRefs.current.set(p.path, el);
              else cellRefs.current.delete(p.path);
            }}
          >
            {/* Each cell sees its own URL (frozen while flying), not the global one. */}
            <Routes location={loc}>
              <Route path="*" element={<p.Component />} />
            </Routes>
          </Cell>
        ))}
      </div>
      {!target && <NotFound />}
    </div>
  );
}

function Cell({
  pos,
  inert,
  focusable,
  cellRef,
  children,
}: {
  pos: Vec;
  inert: boolean;
  focusable?: boolean;
  cellRef?: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // React 18 doesn't know `inert` yet, so set the attribute directly.
  useLayoutEffect(() => {
    ref.current?.toggleAttribute('inert', inert);
  }, [inert]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        cellRef?.(el);
      }}
      className="ws-cell"
      style={cellStyle(pos)}
      tabIndex={focusable ? -1 : undefined}
      aria-hidden={inert ? true : undefined}
    >
      {children}
    </div>
  );
}
