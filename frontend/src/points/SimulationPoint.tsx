import { Navigate, Route, Routes } from 'react-router-dom';
import SimulationEntry from '../simulation/SimulationEntry';
import SimulationStep from '../simulation/SimulationStep';
import SimulationDone from '../simulation/SimulationDone';

/**
 * The flagship journey [0, -3], right under the PC. One point owns all /simulation/* URLs: moving between steps
 * changes what's inside this window, not the camera position. Loaded lazily (see points.tsx); its skeleton lives
 * in Skeletons.tsx.
 */
export default function SimulationPoint() {
  return (
    <Routes>
      <Route path="/simulation" element={<SimulationEntry />} />
      <Route path="/simulation/step/:n" element={<SimulationStep />} />
      <Route path="/simulation/done" element={<SimulationDone />} />
      <Route path="*" element={<Navigate to="/simulation" replace />} />
    </Routes>
  );
}
