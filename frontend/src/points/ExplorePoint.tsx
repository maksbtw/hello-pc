import ExploreScene from '../three/ExploreScene';
import PartPanel from '../explore/PartPanel';
import Lamp from '../explore/Lamp';
import { SkBox, SkLine } from '../workspace/Skeleton';

/** Window 3 [0, -2]: the ready 3D PC (scene) + side panel. */
export function ExplorePoint() {
  return (
    <div className="relative h-full w-full">
      {/* The canvas ends before the panel (360px + 16px margin + 16px gap), so the model is
          centered in the visible area, not under the panel. */}
      <div className="absolute inset-y-0 left-0 right-[392px]">
        {/* Scene lamp: behind the transparent canvas, lights the model. */}
        <Lamp />
        <ExploreScene />
      </div>
      <PartPanel />
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-y-0 left-0 right-[392px] flex items-center justify-center">
        <SkBox className="h-[58%] w-[34%]" />
      </div>
      <SkBox className="absolute bottom-4 right-4 top-4 flex w-[360px] flex-col gap-3 p-6">
        <SkLine className="h-7 w-1/2" />
        <SkLine className="w-4/5" />
        <SkBox className="mt-4 h-12 bg-surface-overlay/40" />
        <SkBox className="h-12 bg-surface-overlay/40" />
        <SkBox className="h-12 bg-surface-overlay/40" />
      </SkBox>
    </div>
  );
}
