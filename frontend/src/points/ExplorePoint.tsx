import ExploreScene from '../three/ExploreScene';
import PartPanel from '../explore/PartPanel';
import Lamp from '../explore/Lamp';

/**
 * Window 3 [0, -2]: the ready 3D PC (scene) + side panel. Loaded lazily (see points.tsx)
 * so three.js stays out of the first download; its skeleton lives in Skeletons.tsx.
 */
export default function ExplorePoint() {
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
