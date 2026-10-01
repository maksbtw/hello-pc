import type { SimulationResponse } from '../types/api';
import helloMock from '../mocks/simulation-hello.json';

/**
 * Klient backendu. Jeśli backend nie odpowiada, zwracamy mock z »Hello«
 * i flagę usedFallback → UI pokaże baner.
 */

export interface SimulationResult {
  data: SimulationResponse;
  usedFallback: boolean;
}

export const FALLBACK_BANNER =
  'Nie udało się przeliczyć Twojego tekstu. Pokazujemy przykład z »Hello«.';

export async function postSimulation(text: string): Promise<SimulationResult> {
  try {
    const res = await fetch('/api/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as SimulationResponse;
    return { data, usedFallback: false };
  } catch {
    return { data: helloMock as SimulationResponse, usedFallback: true };
  }
}

export async function getHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === 'ok';
  } catch {
    return false;
  }
}
