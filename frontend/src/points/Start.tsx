import FlyLink from '../workspace/FlyLink';
import { SkBox, SkLine } from '../workspace/Skeleton';

/** Landing window 1 [0, 0]: what this is + one way forward (down). */
export function Start() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <p className="font-ui text-sm font-medium uppercase tracking-upper text-accent-ink">
        PC Workshop
      </p>
      <h1 className="mt-5 max-w-3xl font-heading text-h1 text-text-bright">
        Zobacz, jak naprawdę działa komputer
      </h1>
      <p className="mt-5 max-w-xl font-ui text-md text-text-muted">
        Rozłóż komputer na części w 3D i prześledź drogę swojego tekstu: od klawisza aż po piksele
        na ekranie.
      </p>
      <FlyLink to="/tour" className="mt-10">
        Dalej
      </FlyLink>
    </div>
  );
}

export function StartSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8">
      <SkLine className="w-28" />
      <SkLine className="h-12 w-[640px]" />
      <SkLine className="w-[480px]" />
      <SkBox className="mt-6 h-12 w-32 rounded-pill" />
    </div>
  );
}
