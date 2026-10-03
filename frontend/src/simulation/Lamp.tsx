import './simulation.css';

/**
 * Lampa z design systemu (Figma, node 9:532): kabelek + trapezowy klosz
 * + świecący poziomy pasek z poświatą + realistyczny stożek światła w dół
 * (jaśniejszy rdzeń + rozmyta otoczka).
 * status:
 *  - idle → miga jak zepsuta żarówka (użytkownik wpisuje dane)
 *  - off  → zgaszona (chwila po wysłaniu — "poszło")
 *  - on   → zapala się i świeci równo
 */

export type LampStatus = 'idle' | 'off' | 'on';

export default function Lamp({ status }: { status: LampStatus }) {
  const cls =
    status === 'idle'
      ? 'sim-lamp sim-lamp--flicker'
      : status === 'off'
        ? 'sim-lamp sim-lamp--off'
        : 'sim-lamp sim-lamp--on';

  return (
    <div aria-hidden className="sim-lamp-wrap">
      <div className={cls}>
        <div className="sim-lamp-cord" />
        <div className="sim-lamp-shade" />
        {/* światło — miga podczas liczenia */}
        <div className="sim-lamp-light">
          <div className="sim-lamp-beam" />
          <div className="sim-lamp-bar" />
        </div>
      </div>
    </div>
  );
}
