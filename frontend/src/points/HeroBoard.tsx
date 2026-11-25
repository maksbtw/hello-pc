import { useEffect, useState } from 'react';
import meta from './hero-board.json';
import './heroBoard.css';

/**
 * Hero backdrop: a rendered motherboard (frontend/tools/board). The board is taller than
 * the window, so the view slowly scrolls from its top edge to its bottom edge and back, on
 * a loop. Purely decorative.
 *
 * The powered-down glow version (board-glow.webp + the LEDs/pulses/strips in
 * hero-board.json) is parked for now; the board lab still exports it.
 */

const BOARD = '/hero/board.webp';
const { crop } = meta as { crop: { x: number; y: number; w: number; h: number } };

export default function HeroBoard() {
  // Show and start scrolling only once the image is decoded, so it never pops in.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.src = BOARD;
    img
      .decode()
      .catch(() => undefined)
      .then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="hero-board" data-ready={ready ? '' : undefined} aria-hidden>
      {/* the stage is the whole board at the window's width; it's what scrolls */}
      <div className="hb-stage" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
        <img className="hb-photo" src={BOARD} alt="" decoding="async" draggable={false} />
      </div>
      <div className="hb-shade" />
    </div>
  );
}
