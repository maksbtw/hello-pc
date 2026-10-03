import type { Step } from '../types/api';

// Metadane 7 kroków symulacji (wg template'u z Figmy). Bez poziomów — jeden opis.
export type IconKey = 'mouse' | 'ssd' | 'ram' | 'cpu' | 'gpu' | 'monitor';

export interface StepMeta {
  id: Step['id'];
  title: string; // tytuł kroku (pasek + nagłówek)
  component: string; // krótki tag podzespołu (pasek)
  stageLabel: string; // nazwa na „scenie" (prawy panel)
  icon: IconKey;
  description: string;
}

export const stepMeta: StepMeta[] = [
  {
    id: 'ssd',
    title: 'Odczyt z dysku',
    component: 'SSD',
    stageLabel: 'Dysk SSD',
    icon: 'ssd',
    description:
      'Kliknięcie uruchamia program. Program leży na dysku jako długi ciąg liczb — Twój tekst też tam jest.',
  },
  {
    id: 'ram',
    title: 'Załadowanie do pamięci',
    component: 'RAM',
    stageLabel: 'Pamięć RAM',
    icon: 'ram',
    description:
      'Każdy bajt dostaje w RAM-ie swój adres, jak numer domu na ulicy — procesor ma je dzięki temu szybko pod ręką.',
  },
  {
    id: 'cpu-decode',
    title: 'Dekodowanie instrukcji',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    icon: 'cpu',
    description:
      'Procesor pobiera instrukcje i je dekoduje — zamienia bajty kodu maszynowego na operacje, które ma wykonać.',
  },
  {
    id: 'text-encode',
    title: 'Tekst jako liczby',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    icon: 'cpu',
    description:
      'Kodowanie UTF-8 zamienia znak na 1–4 bajty. Litery łacińskie zajmują 1 bajt, polskie znaki z ogonkami 2 bajty.',
  },
  {
    id: 'raster',
    title: 'Rasteryzacja',
    component: 'GPU',
    stageLabel: 'Karta graficzna (GPU)',
    icon: 'gpu',
    description:
      'Karta graficzna zamienia tekst na siatkę pikseli — maluje każdy punkt, który ma się zaświecić na ekranie.',
  },
  {
    id: 'display',
    title: 'Wyświetlenie',
    component: 'Monitor',
    stageLabel: 'Monitor',
    icon: 'monitor',
    description:
      'Bufor ramki przechowuje dla każdego piksela 3 liczby: R, G i B od 0 do 255. Monitor odświeża obraz wiele razy na sekundę.',
  },
];
