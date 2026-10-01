import type { Level } from '../types/api';

// Opisy części na 3 poziomach. Placeholdery — uzupełnijcie treść.
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
  Case: { title: 'Obudowa', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  Motherboard: { title: 'Płyta główna', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  CPU: { title: 'Procesor', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  Cooler: { title: 'Chłodzenie', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  RAM: { title: 'Pamięć RAM', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  GPU: { title: 'Karta graficzna', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  SSD: { title: 'Dysk SSD', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  PSU: { title: 'Zasilacz', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  Mouse: { title: 'Mysz', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  Monitor: { title: 'Monitor', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
};
