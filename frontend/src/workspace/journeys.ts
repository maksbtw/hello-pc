import type { PartName } from '../data/parts';

/**
 * The journey row under the PC (y = -3). The flagship "Keyboard → Screen" journey sits
 * right below the PC; each part's journey sits in the same row, left and right of it.
 * Kept separate from points.tsx so the part panel can link here without an import cycle.
 */

export const JOURNEY_ROW_Y = -3;

/** Column of each part's journey; the flagship journey is at x = 0. */
export const PART_JOURNEY_X: Record<PartName, number> = {
  CPU: -1,
  RAM: -2,
  Motherboard: -3,
  Cooler: -4,
  Case: -5,
  GPU: 1,
  SSD: 2,
  Monitor: 3,
  PSU: 4,
  Mouse: 5,
};

export const journeyPath = (part: PartName) => `/journey/${part.toLowerCase()}`;
