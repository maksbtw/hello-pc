import type { Level, Step } from '../types/api';

// Opisy 7 kroków symulacji na 3 poziomach. Placeholdery — uzupełnijcie treść.
export type LevelText = Record<Level, string>;

export const stepMeta: { id: Step['id']; title: string; description: LevelText }[] = [
  { id: 'mouse', title: 'Mysz', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'ssd', title: 'Dysk SSD', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'ram', title: 'Pamięć RAM', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'cpu-decode', title: 'Dekodowanie CPU', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'text-encode', title: 'Kodowanie tekstu', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'raster', title: 'Rasteryzacja', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
  { id: 'display', title: 'Wyświetlanie', description: { noob: 'TODO', mid: 'TODO', expert: 'TODO' } },
];
