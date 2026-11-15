// Single source of truth: every URL is one point on the table.
// Adding a page = adding a row here (with a Component and a Skeleton).
import type { ComponentType } from 'react';
import type { Vec } from './geometry';
import { parts, type PartName } from '../data/parts';
import { JOURNEY_ROW_Y, PART_JOURNEY_X, journeyPath } from './journeys';

import { Start, StartSkeleton } from '../points/Start';
import { Tour, TourSkeleton } from '../points/Tour';
import { ExplorePoint, ExploreSkeleton } from '../points/ExplorePoint';
import { SimulationPoint, SimulationSkeleton } from '../points/SimulationPoint';
import { PartJourney, PartJourneySkeleton } from '../points/PartJourney';

/** A way out of a window, shown in the top-right nav while you're on it. */
export type Exit = {
  to: string;
  label: string;
};

export type Point = {
  /** Canonical URL of the point. */
  path: string;
  /** Grid position in screens. +X = right, +Y = up. */
  pos: Vec;
  /** Short name of the window. */
  label: string;
  /** Buttons in the top bar for this window (back first, then forward). */
  exits: Exit[];
  /** Also owns sub-URLs (path + '/...'). They change the content, not the camera. */
  prefix?: boolean;
  /** Real content: mounted only while it's the current point or one end of a flight. */
  Component: ComponentType;
  /** Cheap placeholder in the same shape: shown when the camera only flies past. */
  Skeleton: ComponentType;
};

const partJourneys: Point[] = (Object.keys(PART_JOURNEY_X) as PartName[]).map((part) => ({
  path: journeyPath(part),
  pos: [PART_JOURNEY_X[part], JOURNEY_ROW_Y],
  label: `Podróż: ${parts[part].title}`,
  exits: [{ to: '/explore', label: 'Do komputera' }],
  Component: () => <PartJourney part={part} />,
  Skeleton: PartJourneySkeleton,
}));

export const POINTS: Point[] = [
  // Landing column, read top to bottom, ending at the PC.
  {
    path: '/',
    pos: [0, 0],
    label: 'Start',
    exits: [{ to: '/tour', label: 'Dalej' }],
    Component: Start,
    Skeleton: StartSkeleton,
  },
  {
    path: '/tour',
    pos: [0, -1],
    label: 'Co jest w środku',
    exits: [
      { to: '/', label: 'Start' },
      { to: '/explore', label: 'Do komputera' },
    ],
    Component: Tour,
    Skeleton: TourSkeleton,
  },
  {
    path: '/explore',
    pos: [0, -2],
    label: 'Komputer',
    exits: [
      { to: '/tour', label: 'Co jest w środku' },
      { to: '/simulation', label: 'Podróż tekstu' },
    ],
    Component: ExplorePoint,
    Skeleton: ExploreSkeleton,
  },
  // Journey row under the PC: the flagship in the middle, part journeys around it.
  {
    path: '/simulation',
    pos: [0, JOURNEY_ROW_Y],
    label: 'Podróż: od klawisza do ekranu',
    exits: [{ to: '/explore', label: 'Do komputera' }],
    prefix: true,
    Component: SimulationPoint,
    Skeleton: SimulationSkeleton,
  },
  ...partJourneys,
];

/** The point that owns `pathname`, or undefined for an unknown URL. */
export function pointFor(pathname: string): Point | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return POINTS.find((p) => p.path === path || (p.prefix && path.startsWith(`${p.path}/`)));
}

// Two points on one cell would render on top of each other: fail loudly in dev.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const p of POINTS) {
    const key = p.pos.join(',');
    if (seen.has(key)) throw new Error(`Two points at [${key}] (${p.path})`);
    seen.add(key);
  }
}
