import type { Step } from '../types/api';
import type { PartName } from './parts';

// Metadane kroków symulacji (wg template'u z Figmy). Bez poziomów.
export type IconKey = 'mouse' | 'ssd' | 'ram' | 'cpu' | 'gpu' | 'monitor';

export interface StepMeta {
  id: Step['id'];
  title: string; // tytuł kroku (pasek)
  component: string; // krótki tag podzespołu (pasek)
  stageLabel: string; // nazwa na „scenie" (prawy panel)
  part: PartName; // powiązany podzespół (do jednozdaniowego opisu z parts.ts)
  icon: IconKey;
  description: string; // dłuższy opis kroku (lewa sekcja, nad grafiką)
}

export const stepMeta: StepMeta[] = [
  {
    id: 'ssd',
    title: 'Odczyt z dysku',
    component: 'SSD',
    stageLabel: 'Dysk SSD',
    part: 'SSD',
    icon: 'ssd',
    description:
      'Gdy uruchamiasz program, komputer odczytuje go z dysku jako długi ciąg bajtów. Twój tekst jest w tym pliku zapisany jako kolejne liczby — tutaj widzisz go wśród reszty danych programu.',
  },
  {
    id: 'ram',
    title: 'Załadowanie do pamięci',
    component: 'RAM',
    stageLabel: 'Pamięć RAM',
    part: 'RAM',
    icon: 'ram',
    description:
      'Dane z dysku trafiają do pamięci RAM, żeby procesor miał do nich szybki dostęp. Każdy bajt dostaje własny adres — jak numer domu na ulicy — pod którym można go znaleźć.',
  },
  {
    id: 'cpu-decode',
    title: 'Dekodowanie instrukcji',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    part: 'CPU',
    icon: 'cpu',
    description:
      'Procesor pobiera z pamięci bajty kodu maszynowego i dekoduje je na instrukcje. Każda instrukcja to jedno proste polecenie — np. przenieś dane albo wypisz tekst na ekran.',
  },
  {
    id: 'text-encode',
    title: 'Tekst jako liczby',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    part: 'CPU',
    icon: 'cpu',
    description:
      'Komputer nie zna liter — każdy znak zapisuje jako liczbę według standardu UTF-8, a potem jako ciąg zer i jedynek. Zwykła litera zajmuje 1 bajt, a polskie znaki z ogonkami nawet 2 bajty.',
  },
  {
    id: 'raster',
    title: 'Rasteryzacja',
    component: 'GPU',
    stageLabel: 'Karta graficzna (GPU)',
    part: 'GPU',
    icon: 'gpu',
    description:
      'Karta graficzna zamienia tekst na obraz: każdą literę rysuje z maleńkich kwadracików — pikseli — jak na kartce w kratkę. Zapalony piksel to 1, zgaszony to 0.',
  },
  {
    id: 'display',
    title: 'Wyświetlenie',
    component: 'Monitor',
    stageLabel: 'Monitor',
    part: 'Monitor',
    icon: 'monitor',
    description:
      'Dla każdego piksela zapisane są trzy liczby: ile ma czerwonego (R), zielonego (G) i niebieskiego (B), od 0 do 255. Monitor zapala piksele w tych kolorach i tak powstaje obraz Twojego tekstu.',
  },
];
