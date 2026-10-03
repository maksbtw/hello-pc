import { create } from 'zustand';
import type { Level, SimulationResponse } from '../types/api';
import type { PartName } from '../data/parts';

/**
 * Globalny store aplikacji. Minimalny szkielet — rozbudujcie wg potrzeb.
 */
interface AppState {
  level: Level;
  text: string;
  response: SimulationResponse | null;
  currentStep: number; // 1..7

  /** Zaznaczona część w scenie 3D (Explore). null = nic nie wybrano. */
  selectedPart: PartName | null;

  setLevel: (level: Level) => void;
  setText: (text: string) => void;
  setResponse: (response: SimulationResponse | null) => void;
  setCurrentStep: (n: number) => void;
  /** Styk sceny 3D (Max) → panel (Anton). Zamrożony kontrakt wg PLAN.md. */
  setSelectedPart: (part: PartName | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  level: 'noob',
  text: '',
  response: null,
  currentStep: 1,
  selectedPart: null,

  setLevel: (level) => set({ level }),
  setText: (text) => set({ text }),
  setResponse: (response) => set({ response }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setSelectedPart: (selectedPart) => set({ selectedPart }),
}));
