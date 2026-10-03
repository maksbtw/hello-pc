# Modele 3D PC Workshop

Zestaw obejmuje osiem dostarczonych części PC oraz **11 nowych modeli wariantów
z głównego README**. Modele są bez marek, w metrach, z lokalnymi materiałami PBR.
Nie wymagają tekstur, CDN, Draco ani innych dekoderów.

## Pliki i warianty

| Część | Wariant | Plik | Pochodzenie |
|---|---|---|---|
| CPU | Desktopowy | `cpu.glb` | dostarczony zestaw |
| CPU | Laptopowy | `cpu-mobile.glb` | nowy |
| CPU | Serwerowy | `cpu-server.glb` | nowy |
| GPU | Dedykowana | `gpu.glb` | dostarczony zestaw |
| GPU | iGPU — schemat obszaru wewnątrz CPU | `gpu-integrated.glb` | nowy |
| RAM | DDR4 | `ram-ddr4.glb` | nowy |
| RAM | DDR5 | `ram-ddr5.glb` | nowy |
| Dysk (`SSD`) | HDD z odsłoniętym wnętrzem | `hdd.glb` | nowy |
| Dysk (`SSD`) | SSD SATA 2,5″ | `ssd-sata.glb` | nowy |
| Dysk (`SSD`) | SSD M.2 NVMe | `ssd.glb` | dostarczony zestaw |
| Płyta główna | ATX | `motherboard.glb` | dostarczony zestaw |
| Płyta główna | microATX | `motherboard-micro-atx.glb` | nowy |
| Płyta główna | Mini-ITX | `motherboard-mini-itx.glb` | nowy |
| Monitor | IPS | `monitor-ips.glb` | nowy |
| Monitor | OLED | `monitor-oled.glb` | nowy |
| Zasilacz | domyślny | `psu.glb` | dostarczony zestaw |
| Obudowa | domyślna | `pc-case.glb` | dostarczony zestaw |
| Chłodzenie | domyślne | `cooler.glb` | dostarczony zestaw |

`ram.glb` to oryginalny, ogólny DIMM, zachowany do złożonego komputera. Nie przypisujemy
mu arbitralnie standardu DDR4 lub DDR5. Osobne modele DDR4/DDR5 służą do inspektora Demo.

Monitory IPS i OLED mają wspólny poglądowy wygląd obudowy. Warianty **60 i 144 Hz**
są opisane w `catalog.json` jako parametry, bez sztucznych różnic geometrii.
Nie jest to przekrój budowy panelu ani demonstracja odświeżania.

Zgodnie z zawężeniem zadania powstały warianty wymienione w README. **Myszy nie ma
w tym zestawie.** Dla obudowy, zasilacza i chłodzenia README nie podaje dodatkowych typów.

## Podłączenie do Demo

- `catalog.json` mapuje `partId` i typ na plik, także cztery kombinacje panelu i Hz.
- `assembly-manifest.json` opisuje osiem części złożonego PC.
- `supplementary-manifest.json` zawiera granice, środek inspekcji, liczbę trójkątów
  i zastosowanie każdego nowego modelu.
- Główny node każdego pliku ma nazwę `Case`, `Motherboard`, `CPU`, `Cooler`, `RAM`,
  `GPU`, `SSD`, `PSU` lub `Monitor`. HDD zachowuje `SSD` jako istniejący identyfikator
  kategorii dysków. iGPU ma identyfikator `GPU`.
- `PC_Case` z oryginalnego zestawu zostało przemianowane na `Case` w kopii GLB.
- Ładowanie: `useGLTF('/models/cpu-mobile.glb')`.

Osiem oryginalnych plików ma wspólne pozycje montażowe: dodaj je wszystkie przy
`position=[0,0,0]`, `rotation=[0,0,0]`, `scale=[1,1,1]`. Można zamiast tego użyć
`pc-assembly.glb`; jednoczesne dodanie obu wersji dubluje geometrię.

Nowe modele mają `usage: inspection-only` albo `peripheral`. **Nie są zamiennikami
do automatycznego montażu w istniejącej obudowie.** Są osobnymi obiektami do oglądania
po wyborze typu w Demo. Złożony komputer zachowuje swoją geometrię.

Dla inspektora sklonuj scenę modelu i odejmij od jej pozycji `inspection_pivot`
z manifestu. Obracaj grupę z wycentrowanym modelem; oryginalna scena pozostaje
przydatna do złożenia PC. Przy podświetlaniu klonuj także materiały.

glTF ma +Y do góry, przód w stronę −Z. Eksporter Blendera konwertuje osie;
nie dodawaj kolejnego obrotu o 90°. Obracanie w Demo powinno obejmować także spód,
np. styki procesora lub drugą stronę RAM.

## Źródła i podglądy

- [Nowy edytowalny master](../../../assets/blender/supplementary-master.blend)
  — osobna kolekcja dla każdego wariantu. Początkowo widoczny jest tylko monitor IPS;
  w Outlinerze włącz kolekcję oglądanego wariantu i wyłącz pozostałe.
- [Oryginalny master PC](../../../assets/blender/pc-original.blend)
  — zachowany bez zmian.
- [Skrypt generujący modele](../../../assets/blender/build_missing_models.py).
- [Podglądy PNG](../../../assets/previews/README.md).

Modele są poglądowe. Rozmieszczenie pinów, kluczowanie DIMM, gniazda i układy CPU
nie odtwarzają konkretnego produktu ani specyfikacji kompatybilności. iGPU to
umowny podział wnętrza układu, a otwarty HDD służy pokazaniu talerzy i głowicy.

## Odtworzenie i sprawdzenie

Uruchamiaj z katalogu głównego repozytorium:

```sh
# Import dostarczonych plików (źródłowy folder pozostaje bez zmian).
python3 scripts/import-pc-kit.py /sciezka/do/pc-kit

# Odtwarza 11 nowych GLB, master .blend, manifest i podglądy PNG.
blender --background --factory-startup --python assets/blender/build_missing_models.py

# Sprawdza dane binarne, geometrię, nazwy i pokrycie katalogu wariantów.
python3 scripts/validate-models.py

# Ładuje modele prawdziwym GLTFLoaderem z zainstalowanego Three.js.
node frontend/scripts/validate-models.mjs
```

Raport walidacji binarnej jest zapisany w `assets/model-validation.json`.
Skrypt generujący zastępuje wyłącznie własne eksporty i plik `supplementary-master.blend`;
manualne zmiany mastera zapisz pod inną nazwą przed ponownym generowaniem.
