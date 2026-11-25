import { BookOpen, Boxes, Route, type LucideIcon } from 'lucide-react';
import { SkLine } from '../workspace/Skeleton';

/** Landing window 2 [0, -1]: a short look at what's inside, then down to the PC. */

const FEATURES: { icon: LucideIcon; title: string; text: string; soon?: boolean }[] = [
  {
    icon: Boxes,
    title: 'Eksploruj',
    text: 'Model 3D komputera. Kliknij część, żeby zobaczyć, co robi i jakie ma rodzaje.',
  },
  {
    icon: Route,
    title: 'Podróże',
    text: 'Wpisz tekst i zobacz, jak przechodzi przez pamięć, procesor i kartę graficzną aż na ekran.',
  },
  {
    icon: BookOpen,
    title: 'Pojęcia',
    text: 'Słowniczek: bit, bajt, taktowanie, pamięć podręczna i inne.',
    soon: true,
  },
];

/** A ruled list, not a row of cards: the three sections read top to bottom like a contents page. */
export function Tour() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="w-full max-w-3xl">
        <h2 className="font-heading text-h2 text-text-bright">Co jest w środku</h2>
        <ul className="mt-10 border-b border-border">
          {FEATURES.map(({ icon: Icon, title, text, soon }) => (
            <li
              key={title}
              className="grid grid-cols-[14rem_1fr] items-baseline gap-8 border-t border-border py-6"
            >
              <h3 className="flex items-center gap-3 font-heading text-xl text-text-bright">
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className="flex-none self-center text-accent-ink"
                  aria-hidden
                />
                {title}
                {soon && (
                  <span className="rounded-pill border border-border-strong px-2 py-0.5 font-ui text-code text-text-dim">
                    wkrótce
                  </span>
                )}
              </h3>
              <p className="font-ui text-md text-text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TourSkeleton() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="w-full max-w-3xl">
        <SkLine className="h-10 w-80" />
        <div className="mt-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[14rem_1fr] gap-8 py-7">
              <SkLine className="w-32" />
              <div className="flex flex-col gap-2.5">
                <SkLine className="w-11/12" />
                <SkLine className="w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
