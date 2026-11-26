import FlyLink from '../workspace/FlyLink';
import { SkBox, SkLine } from '../workspace/Skeleton';
import HeroBoard from './HeroBoard';
import HeroRetro from './HeroRetro';
import HeroPaperRender from './HeroPaperRender';
import PaperLink from './PaperLink';

/** Which hero the landing shows: the drawing sheet, the retro computer, or the motherboard. */
const HERO = 'paper' as 'paper' | 'retro' | 'board';

/** Landing window 1 [0, 0]: what this is + one way forward (down). */
export function Start() {
  if (HERO === 'paper') {
    return (
      <div className="relative h-full">
        <h1 className="sr-only">Zobacz, jak naprawdę działa komputer</h1>
        <HeroPaperRender>
          <PaperLink to="/tour" label="Dalej" className="bottom-[8%] left-[6%]" />
        </HeroPaperRender>
      </div>
    );
  }
  if (HERO === 'retro') {
    return (
      <div className="relative h-full">
        <HeroRetro to="/tour" />
      </div>
    );
  }
  return (
    <div className="relative flex h-full items-center justify-center px-8">
      <HeroBoard />
      <div className="relative flex flex-col items-center text-center">
        <h1 className="max-w-3xl font-heading text-h1 text-text-bright">
          Zobacz, jak naprawdę działa komputer
        </h1>
        <p className="mt-5 max-w-xl font-ui text-md text-text-muted">
          Rozłóż komputer na części w 3D i prześledź drogę swojego tekstu: od klawisza aż po
          piksele na ekranie.
        </p>
        <FlyLink to="/tour" variant="key" className="mt-10">
          Dalej
        </FlyLink>
      </div>
    </div>
  );
}

export function StartSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8">
      <SkLine className="h-12 w-[640px]" />
      <SkLine className="w-[480px]" />
      <SkBox className="mt-6 h-[62px] w-36 rounded-[14px]" />
    </div>
  );
}
