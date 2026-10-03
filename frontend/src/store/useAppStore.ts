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
  autoPlay: boolean; // auto-przewijanie kroków symulacji
  usedFallback: boolean; // dane z mocka (backend nie odpowiedział)

  /** Zaznaczona część w scenie 3D (Explore). null = nic nie wybrano. */
  selectedPart: PartName | null;
  /** Podświetlony/opisywany wariant w rzędzie inspekcji. null = brak/domyślny. */
  focusedVariant: string | null;

  setLevel: (level: Level) => void;
  setText: (text: string) => void;
  setResponse: (response: SimulationResponse | null) => void;
  setCurrentStep: (n: number) => void;
  setAutoPlay: (on: boolean) => void;
  setUsedFallback: (on: boolean) => void;
  /** Styk sceny 3D (Max) → panel (Anton). Zamrożony kontrakt wg PLAN.md. */
  setSelectedPart: (part: PartName | null) => void;
  setFocusedVariant: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  level: 'noob',
  text: '',
  response: null,
  currentStep: 1,
  autoPlay: false,
  usedFallback: false,
  selectedPart: null,
  focusedVariant: null,

  setLevel: (level) => set({ level }),
  setText: (text) => set({ text }),
  setResponse: (response) => set({ response }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  setUsedFallback: (usedFallback) => set({ usedFallback }),
  // Zmiana części resetuje podświetlony wariant.
  setSelectedPart: (selectedPart) => set({ selectedPart, focusedVariant: null }),
  setFocusedVariant: (focusedVariant) => set({ focusedVariant }),
}));
