import { create } from 'zustand';
import type { Level, SimulationResponse } from '../types/api';

/**
 * Globalny store aplikacji. Minimalny szkielet — rozbudujcie wg potrzeb.
 */
interface AppState {
  level: Level;
  text: string;
  response: SimulationResponse | null;
  currentStep: number; // 1..7
  autoPlay: boolean; // auto-przewijanie kroków symulacji
  usedFallback: boolean; // dane z mocka (backend nie odpowiedział)

  setLevel: (level: Level) => void;
  setText: (text: string) => void;
  setResponse: (response: SimulationResponse | null) => void;
  setCurrentStep: (n: number) => void;
  setAutoPlay: (on: boolean) => void;
  setUsedFallback: (on: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  level: 'noob',
  text: '',
  response: null,
  currentStep: 1,
  autoPlay: false,
  usedFallback: false,

  setLevel: (level) => set({ level }),
  setText: (text) => set({ text }),
  setResponse: (response) => set({ response }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  setUsedFallback: (usedFallback) => set({ usedFallback }),
}));
