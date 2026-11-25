import { parts, type PartName } from '../data/parts';
import { SkBox, SkLine } from '../workspace/Skeleton';

/**
 * A part's own journey (what happens inside it), one window per part in the row under
 * the PC. The journeys aren't written yet: for now each window says what it will show.
 */
export function PartJourney({ part }: { part: PartName }) {
  const { title, tagline } = parts[part];
  return (
    <div className="flex h-full items-center justify-center px-8">
      <section className="glass flex w-[560px] flex-col items-center gap-4 rounded-xl p-10 text-center">
        <h1 className="font-heading text-h2 text-text-bright">{title} od środka</h1>
        <p className="font-ui text-md text-text-muted">{tagline}</p>
        <span className="mt-2 rounded-pill border border-border-strong px-3 py-1 font-ui text-sm text-text-dim">
          wkrótce
        </span>
      </section>
    </div>
  );
}

export function PartJourneySkeleton() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <SkBox className="flex h-64 w-[560px] flex-col items-center gap-4 p-10">
        <SkLine className="h-10 w-72" />
        <SkLine className="w-96" />
        <SkLine className="w-64" />
      </SkBox>
    </div>
  );
}
