import { SkBox, SkLine } from '../workspace/Skeleton';

/**
 * Skeletons of the lazily loaded windows. They live apart from the windows themselves so
 * the main bundle can show them (during flights and while a chunk loads) without pulling
 * in three.js.
 */

export function ExploreSkeleton() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-y-0 left-0 right-[392px] flex items-center justify-center">
        <SkBox className="h-[58%] w-[34%]" />
      </div>
      <SkBox className="absolute bottom-4 right-4 top-4 flex w-[360px] flex-col gap-3 p-6">
        <SkLine className="h-7 w-1/2" />
        <SkLine className="w-11/12" />
        <SkLine className="w-3/4" />
        <div className="mt-5 flex flex-col gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <SkLine key={i} className="w-2/5" />
          ))}
        </div>
      </SkBox>
    </div>
  );
}

export function SimulationSkeleton() {
  return (
    <div className="flex h-full">
      <div className="flex w-1/2 flex-col justify-center gap-4 px-16">
        <SkLine className="h-11 w-96" />
        <SkLine className="h-11 w-64" />
        <SkLine className="mt-2 w-96" />
        <SkLine className="w-80" />
        <SkBox className="mt-8 h-16 w-[448px] rounded-lg" />
        <SkBox className="mt-4 h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}
