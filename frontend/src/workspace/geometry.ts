// Grid math for the "camera over a table" navigation.
// One cell = one screen. +X = right, +Y = up.

export type Vec = [x: number, y: number];

/** Distance between two points, in cell units. */
export const distance = (a: Vec, b: Vec) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Flight time grows with distance but never feels sluggish. */
export const durationFor = (a: Vec, b: Vec) => Math.min(450 + 250 * distance(a, b), 1200);

export const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * Does the camera (a 1x1 window) flying in a straight line from `a` to `b` ever show
 * any part of the cell at `p`? The window at camera position c overlaps cell p when
 * max(|cx-px|, |cy-py|) < 1. That function is convex in t, so sampling is accurate enough.
 */
export function isPassedBy(a: Vec, b: Vec, p: Vec, steps = 64): boolean {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = a[0] + (b[0] - a[0]) * t;
    const cy = a[1] + (b[1] - a[1]) * t;
    if (Math.max(Math.abs(cx - p[0]), Math.abs(cy - p[1])) < 0.999) return true;
  }
  return false;
}

/** Transform for the world layer so the camera looks at `pos`. Percentages are of the
 *  world element, which is exactly one cell in size. */
export const cameraTransform = ([x, y]: Vec) => `translate3d(${-x * 100}%, ${y * 100}%, 0)`;

/** Position of a cell inside the world layer. */
export const cellStyle = ([x, y]: Vec) => ({ left: `${x * 100}%`, top: `${-y * 100}%` });

/** Table texture offset for camera position `pos` (the texture slides with the camera). */
export const bgPosition = ([x, y]: Vec, el: HTMLElement) =>
  `${-x * el.clientWidth}px ${y * el.clientHeight}px`;
