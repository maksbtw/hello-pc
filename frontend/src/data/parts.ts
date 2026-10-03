import type { Level } from '../types/api';

// Opisy części na 2 poziomach (noob/expert). Placeholdery — uzupełnijcie treść.
export type PartName =
  | 'Case'
  | 'Motherboard'
  | 'CPU'
  | 'Cooler'
  | 'RAM'
  | 'GPU'
  | 'SSD'
  | 'PSU'
  | 'Mouse'
  | 'Monitor';

export type LevelText = Record<Level, string>;

export const parts: Record<PartName, { title: string; description: LevelText }> = {
  Case: { title: 'Obudowa', description: { noob: 'TODO', expert: 'TODO' } },
  Motherboard: { title: 'Płyta główna', description: { noob: 'TODO', expert: 'TODO' } },
  CPU: { title: 'Procesor', description: { noob: 'TODO', expert: 'TODO' } },
  Cooler: { title: 'Chłodzenie', description: { noob: 'TODO', expert: 'TODO' } },
  RAM: { title: 'Pamięć RAM', description: { noob: 'TODO', expert: 'TODO' } },
  GPU: { title: 'Karta graficzna', description: { noob: 'TODO', expert: 'TODO' } },
  SSD: { title: 'Dysk SSD', description: { noob: 'TODO', expert: 'TODO' } },
  PSU: { title: 'Zasilacz', description: { noob: 'TODO', expert: 'TODO' } },
  Mouse: { title: 'Mysz', description: { noob: 'TODO', expert: 'TODO' } },
  Monitor: { title: 'Monitor', description: { noob: 'TODO', expert: 'TODO' } },
};
