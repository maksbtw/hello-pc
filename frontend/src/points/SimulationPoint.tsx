import { Navigate, Route, Routes } from 'react-router-dom';
import SimulationEntry from '../simulation/SimulationEntry';
import SimulationStep from '../simulation/SimulationStep';
import SimulationDone from '../simulation/SimulationDone';
import { SkBox, SkLine } from '../workspace/Skeleton';

/**
 * The flagship journey [0, -3], right under the PC. One point owns all /simulation/* URLs: moving between steps
 * changes what's inside this window, not the camera position.
 */
export function SimulationPoint() {
  return (
    <Routes>
      <Route path="/simulation" element={<SimulationEntry />} />
      <Route path="/simulation/step/:n" element={<SimulationStep />} />
      <Route path="/simulation/done" element={<SimulationDone />} />
      <Route path="*" element={<Navigate to="/simulation" replace />} />
    </Routes>
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
