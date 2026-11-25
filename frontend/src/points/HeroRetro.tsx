import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useEnterToFly } from '../workspace/FlyLink';
import meta from './hero-retro.json';
import './heroRetro.css';

/**
 * Hero: a rendered beige desktop computer (tools/retro). The headline is live text on its
 * CRT, and the green space bar is the real "Dalej" link: hover and press swap in renders
 * of the key at those depths. hero-retro.json says where the screen and key sit in the image.
 */

const IMG = '/hero/retro.webp';
const KEY_HOVER = '/hero/retro-key-hover.webp';
const KEY_DOWN = '/hero/retro-key-down.webp';

type Rect = { x: number; y: number; w: number; h: number };
const { aspect, screen, key } = meta as { aspect: number; screen: Rect; key: Rect };
const place = (r: Rect): CSSProperties => ({
  left: `${r.x * 100}%`,
  top: `${r.y * 100}%`,
  width: `${r.w * 100}%`,
  height: `${r.h * 100}%`,
});

export default function HeroRetro({ to }: { to: string }) {
  const [ready, setReady] = useState(false);
  const keyRef = useRef<HTMLAnchorElement>(null);
  const pressed = useEnterToFly(keyRef, to);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.src = IMG;
    img
      .decode()
      .catch(() => undefined)
      .then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="hero-retro" data-ready={ready ? '' : undefined}>
      <div className="hr-rig" style={{ '--a': aspect } as CSSProperties}>
        <img className="hr-photo" src={IMG} alt="" decoding="async" draggable={false} />

        <div className="hr-screen" style={place(screen)}>
          <div className="hr-glass">
            <h1 className="hr-title font-heading">Zobacz, jak naprawdę działa komputer</h1>
            <p className="hr-lede font-ui">
              Rozłóż komputer na części w 3D i prześledź drogę swojego tekstu: od klawisza aż
              po piksele na ekranie.
              <span className="hr-cursor" aria-hidden />
            </p>
          </div>
        </div>

        <Link
          ref={keyRef}
          to={to}
          className="hr-key"
          style={place(key)}
          data-pressed={pressed ? '' : undefined}
          aria-keyshortcuts="Enter"
          draggable={false}
        >
          <img className="hr-key-hover" src={KEY_HOVER} alt="" draggable={false} />
          <img className="hr-key-down" src={KEY_DOWN} alt="" draggable={false} />
          <span className="sr-only">Dalej</span>
        </Link>
      </div>
    </div>
  );
}
