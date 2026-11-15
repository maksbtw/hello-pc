import { BookOpen, Boxes, Route, type LucideIcon } from 'lucide-react';
import { SkBox, SkLine } from '../workspace/Skeleton';

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

export function Tour() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <h2 className="text-center font-heading text-h2 text-text-bright">Co jest w środku</h2>
      <div className="mt-12 grid w-full max-w-5xl grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, text, soon }) => (
          <section key={title} className="glass flex flex-col gap-3 rounded-xl p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-on shadow-edge">
              <Icon size={19} strokeWidth={1.8} aria-hidden />
            </span>
            <h3 className="mt-2 flex items-center gap-2 font-heading text-xl text-text-bright">
              {title}
              {soon && (
                <span className="rounded-pill border border-border-strong px-2 py-0.5 font-ui text-code font-medium text-text-dim">
                  wkrótce
                </span>
              )}
            </h3>
            <p className="font-ui text-base text-text-muted">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function TourSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <SkLine className="h-10 w-80" />
      <div className="mt-12 grid w-full max-w-5xl grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <SkBox key={i} className="flex h-52 flex-col gap-3 p-6">
            <SkBox className="h-10 w-10 rounded-md bg-surface-overlay/60" />
            <SkLine className="mt-3 w-1/3" />
            <SkLine className="w-11/12" />
            <SkLine className="w-3/4" />
          </SkBox>
        ))}
      </div>
    </div>
  );
}
