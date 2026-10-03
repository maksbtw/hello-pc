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
  descTop: string; // 1. część opisu — kontekst/„co się dzieje" (góra)
  descBottom: string; // 2. część opisu — szczegół/„jak to działa" (dół)
}

export const stepMeta: StepMeta[] = [
  {
    id: 'ssd',
    title: 'Odczyt z dysku',
    component: 'SSD',
    stageLabel: 'Dysk SSD',
    part: 'SSD',
    icon: 'ssd',
    descTop:
      'Wpisałeś tekst — teraz prześledzimy, co dzieje się z nim wewnątrz komputera. Podróż zaczyna się na dysku, bo to stamtąd komputer wczytuje program, który pokaże Twój tekst na ekranie.',
    descBottom:
      'Dla komputera litery to liczby.\nKażdy znak Twojego tekstu jest zapisany na dysku jako bajt — tutaj widzisz, która liczba odpowiada której literze.',
  },
  {
    id: 'ram',
    title: 'Załadowanie do pamięci',
    component: 'RAM',
    stageLabel: 'Pamięć RAM',
    part: 'RAM',
    icon: 'ram',
    descTop:
      'Dysk jest wolny, więc zanim procesor zacznie pracę, Twój tekst wraz z programem są kopiowane do pamięci RAM — szybkiej pamięci podręcznej komputera.',
    descBottom:
      'W RAM każdy bajt dostaje własny adres, jak numer domu na ulicy. Dzięki temu procesor może błyskawicznie sięgnąć po dowolną literę, znając tylko jej adres.',
  },
  {
    id: 'cpu-decode',
    title: 'Dekodowanie instrukcji',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    part: 'CPU',
    icon: 'cpu',
    descTop:
      'Program to lista poleceń dla procesora, zapisana jako liczby (kod maszynowy). Procesor czyta je z pamięci po kolei.',
    descBottom:
      'Każdą liczbę procesor dekoduje na instrukcję — proste polecenie, np. „przenieś dane" albo „wypisz tekst". Podświetlona instrukcja to ta wykonywana właśnie teraz.',
  },
  {
    id: 'text-encode',
    title: 'Tekst jako liczby',
    component: 'CPU',
    stageLabel: 'Procesor (CPU)',
    part: 'CPU',
    icon: 'cpu',
    descTop:
      'Skąd komputer wie, że liczba 72 to litera „H"? \nZ ustalonego kodowania UTF-8 — które każdej literze przypisuje liczbę.',
    descBottom:
      'Procesor operuje tylko na zerach i jedynkach, więc każda liczba to tak naprawdę ciąg bitów. \nZwykła litera zajmuje 1 bajt (8 bitów), a polskie znaki z ogonkami aż 2 bajty.',
  },
  {
    id: 'raster',
    title: 'Rasteryzacja',
    component: 'GPU',
    stageLabel: 'Karta graficzna (GPU)',
    part: 'GPU',
    icon: 'gpu',
    descTop:
      'Monitor nie rozumie liter — potrafi tylko zapalać punkty. Dlatego karta graficzna musi najpierw zamienić tekst na obrazek.',
    descBottom:
      'Każda litera jest rysowana z maleńkich kwadracików — pikseli, jak na kartce w kratkę. \nZapalony piksel to 1, zgaszony to 0.',
  },
  {
    id: 'display',
    title: 'Wyświetlenie',
    component: 'Monitor',
    stageLabel: 'Monitor',
    part: 'Monitor',
    icon: 'monitor',
    descTop:
      'Gotowy obraz — siatka pikseli z poprzedniego kroku — trafia do monitora przez kabel wideo.',
    descBottom:
      'Monitor zapala piksele i odświeża obraz wiele razy na sekundę. \n Tutaj Twój tekst pojawia się na ekranie znak po znaku — tak, jak komputer go wypisuje.',
  },
];
