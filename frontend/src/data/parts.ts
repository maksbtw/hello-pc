/** Reading levels used by curated component descriptions. */
export type PartLevel = 'noob' | 'expert';

export type LevelText = Record<PartLevel, string>;

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

export interface PartType {
  /** Stable key for selection and AI context. */
  id: string;
  name: string;
  tagline: string;
  description: LevelText;
  /** Short, atomic statements suitable as grounded AI context. */
  facts: string[];
  parameters: Record<string, string>;
}

export interface PartDescription {
  title: string;
  tagline: string;
  description: LevelText;
  facts: string[];
  types: PartType[];
}

export const parts: Record<PartName, PartDescription> = {
  Case: {
    title: 'Obudowa',
    tagline: 'Chroni podzespoły i zapewnia miejsce na ich montaż oraz przepływ powietrza.',
    description: {
      noob: 'Obudowa to szkielet komputera. Trzyma części na miejscu, chroni je i pomaga odprowadzać ciepło.',
      expert: 'Obudowa zapewnia punkty montażowe, określa zgodność formatów komponentów i wpływa na przepływ powietrza oraz poziom hałasu.',
    },
    facts: [
      'Obudowa utrzymuje podzespoły w ustalonym położeniu.',
      'Format obudowy ogranicza rozmiar płyty głównej i długość karty graficznej, które można zamontować.',
      'Otwory wentylacyjne i rozmieszczenie wentylatorów wpływają na przepływ powietrza.',
    ],
    types: [
      {
        id: 'compact', name: 'Kompaktowa (Mini-ITX)', tagline: 'Mała, oszczędza miejsce i wymaga starannego doboru części.',
        description: {
          noob: 'Mała obudowa do niewielkiego komputera. Pasuje do niej mała płyta, a miejsca na duże części jest mniej.',
          expert: 'Kompaktowa obudowa zwykle obsługuje płyty Mini-ITX; ogranicza przestrzeń na chłodzenie, zasilacz i długość GPU.',
        },
        facts: ['Kompaktowe obudowy zwykle obsługują płyty Mini-ITX.', 'Wymiary obudowy mogą ograniczać długość GPU i wysokość chłodzenia CPU.'],
        parameters: { 'Typowa płyta': 'Mini-ITX', 'Priorytet': 'małe wymiary' },
      },
      {
        id: 'mid-tower', name: 'Mid-tower', tagline: 'Uniwersalny rozmiar z miejscem na typowe podzespoły.',
        description: {
          noob: 'To popularny, średniej wielkości format. Zwykle mieści standardową płytę i kilka dodatkowych części.',
          expert: 'Mid-tower najczęściej obsługuje płyty ATX i mniejsze, oferując więcej miejsca na GPU, chłodzenie i wentylatory niż format kompaktowy.',
        },
        facts: ['Wiele obudów mid-tower obsługuje płyty ATX, microATX i Mini-ITX.', 'Zgodność wymiarów konkretnej karty i chłodzenia zależy od modelu obudowy.'],
        parameters: { 'Typowa płyta': 'ATX lub mniejsza', 'Priorytet': 'uniwersalność' },
      },
      {
        id: 'full-tower', name: 'Full-tower', tagline: 'Duża obudowa zapewniająca dużo miejsca na rozbudowę.',
        description: {
          noob: 'Duża obudowa, w której łatwiej zmieścić wiele części i duże chłodzenie.',
          expert: 'Full-tower oferuje dużą przestrzeń montażową i zwykle obsługuje płyty ATX oraz większe formaty; szczegóły zależą od modelu.',
        },
        facts: ['Większa obudowa nie gwarantuje lepszego chłodzenia bez odpowiedniego przepływu powietrza.', 'Maksymalne wymiary komponentów trzeba sprawdzić w specyfikacji obudowy.'],
        parameters: { 'Typowa płyta': 'ATX lub większa', 'Priorytet': 'miejsce na rozbudowę' },
      },
    ],
  },
  Motherboard: {
    title: 'Płyta główna',
    tagline: 'Łączy podzespoły i określa, jakie części są ze sobą zgodne.',
    description: {
      noob: 'Płyta główna to miejsce, do którego podłącza się procesor, pamięć, dyski i inne części.',
      expert: 'Płyta główna udostępnia gniazdo CPU, sloty pamięci i rozszerzeń oraz kontrolery i złącza komunikacyjne.',
    },
    facts: ['Gniazdo procesora musi pasować do procesora.', 'Płyta główna określa obsługiwany typ pamięci i liczbę slotów.', 'Rozmiar płyty musi być obsługiwany przez obudowę.'],
    types: [
      { id: 'atx', name: 'ATX', tagline: 'Pełnowymiarowa płyta z dużą liczbą slotów i złączy.', description: { noob: 'Duża płyta główna z miejscem na więcej kart i złączy.', expert: 'ATX to format płyty o wymiarach 305 × 244 mm; oferuje więcej przestrzeni na sloty niż mniejsze formaty.' }, facts: ['Standardowy wymiar ATX to 305 × 244 mm.', 'Obudowa musi deklarować obsługę ATX.'], parameters: { 'Wymiary': '305 × 244 mm', 'Rozszerzenia': 'zwykle więcej slotów niż w mniejszych formatach' } },
      { id: 'micro-atx', name: 'microATX', tagline: 'Mniejsza płyta, która nadal zapewnia podstawową możliwość rozbudowy.', description: { noob: 'Nieco mniejsza płyta, często tańsza i mieszcząca się w wielu obudowach.', expert: 'microATX ma maksymalny wymiar 244 × 244 mm i może być montowana w obudowie obsługującej microATX lub ATX.' }, facts: ['Maksymalny wymiar microATX to 244 × 244 mm.', 'Liczba slotów rozszerzeń zależy od konkretnej płyty.'], parameters: { 'Maksymalny wymiar': '244 × 244 mm', 'Rozszerzenia': 'zależne od modelu' } },
      { id: 'mini-itx', name: 'Mini-ITX', tagline: 'Mała płyta do kompaktowych komputerów.', description: { noob: 'Bardzo mała płyta główna do niewielkich obudów.', expert: 'Mini-ITX ma wymiary 170 × 170 mm; zwykle oferuje jeden slot PCIe i dwa sloty pamięci, zależnie od modelu.' }, facts: ['Standardowy wymiar Mini-ITX to 170 × 170 mm.', 'Mniejszy format zwykle oferuje mniej slotów rozszerzeń.'], parameters: { 'Wymiary': '170 × 170 mm', 'Priorytet': 'kompaktowy zestaw' } },
    ],
  },
  CPU: {
    title: 'Procesor',
    tagline: 'Wykonuje instrukcje programów i koordynuje pracę komputera.',
    description: {
      noob: 'Procesor wykonuje obliczenia i polecenia programów. Można go porównać do pracownika, który realizuje zadania komputera.',
      expert: 'CPU pobiera, dekoduje i wykonuje instrukcje; wydajność zależy m.in. od mikroarchitektury, liczby rdzeni, częstotliwości i limitów mocy.',
    },
    facts: ['Procesor wykonuje instrukcje programów.', 'Rdzenie mogą wykonywać wiele zadań równolegle.', 'Kompatybilność procesora zależy m.in. od gniazda i obsługi przez płytę główną.'],
    types: [
      { id: 'desktop', name: 'Desktopowy', tagline: 'Procesor do komputera stacjonarnego.', description: { noob: 'Procesor do komputera stojącego na biurku. Często można go połączyć z mocnym chłodzeniem.', expert: 'Desktopowe CPU są projektowane dla platform stacjonarnych; wymagają zgodnego gniazda, płyty i rozwiązania chłodzącego.' }, facts: ['Procesor desktopowy musi pasować do gniazda płyty głównej.', 'Pobór mocy i wydzielane ciepło zależą od modelu i obciążenia.'], parameters: { 'Platforma': 'komputer stacjonarny', 'Zgodność': 'gniazdo i chipset płyty' } },
      { id: 'mobile', name: 'Laptopowy (mobilny)', tagline: 'Procesor zaprojektowany z myślą o ograniczonej energii i miejscu.', description: { noob: 'Procesor do laptopa, który ma działać w małej obudowie i oszczędzać baterię.', expert: 'Mobilne CPU są integrowane w platformie laptopa i dostosowane do ograniczeń mocy, chłodzenia oraz czasu pracy na baterii.' }, facts: ['Mobilne procesory są dobierane do konstrukcji konkretnego laptopa.', 'Możliwości modernizacji zależą od sposobu montażu procesora w laptopie.'], parameters: { 'Platforma': 'laptop', 'Priorytet': 'wydajność przy ograniczonym poborze mocy' } },
      { id: 'server', name: 'Serwerowy', tagline: 'Procesor przeznaczony do długiej pracy i zadań serwerowych.', description: { noob: 'Procesor do serwera, który obsługuje usługi lub obliczenia dla wielu użytkowników.', expert: 'Serwerowe CPU są przeznaczone do pracy w platformach wielordzeniowych i mogą obsługiwać funkcje takie jak pamięć ECC; zakres zależy od modelu.' }, facts: ['Funkcje serwerowego CPU zależą od konkretnej platformy.', 'Wiele platform serwerowych obsługuje pamięć ECC.', 'Serwerowy procesor wymaga zgodnej płyty i chłodzenia.'], parameters: { 'Platforma': 'serwer lub stacja robocza', 'Typowe zastosowanie': 'usługi, wirtualizacja, obliczenia' } },
    ],
  },
  Cooler: {
    title: 'Chłodzenie',
    tagline: 'Odprowadza ciepło z procesora, aby mógł pracować w bezpiecznych warunkach.',
    description: {
      noob: 'Procesor mocno się nagrzewa podczas pracy. Chłodzenie odbiera od niego ciepło i oddaje je do powietrza.',
      expert: 'Układ chłodzenia przenosi ciepło z IHS procesora do radiatora, a następnie oddaje je do otoczenia; skuteczność zależy od obciążenia i przepływu powietrza.',
    },
    facts: ['Chłodzenie musi być zgodne z gniazdem procesora.', 'Radiator oddaje ciepło do powietrza.', 'Pasta termoprzewodząca wypełnia mikroszczeliny między procesorem a podstawą chłodzenia.'],
    types: [
      { id: 'air', name: 'Powietrzne', tagline: 'Radiator i wentylator chłodzą procesor.', description: { noob: 'Metalowe żeberka odbierają ciepło, a wentylator przepycha przez nie powietrze.', expert: 'Chłodzenie powietrzne wykorzystuje podstawę, ciepłowody, radiator i wentylator; wydajność zależy od konstrukcji i przepływu powietrza w obudowie.' }, facts: ['Chłodzenie powietrzne nie wymaga pompy cieczy.', 'Wysokość radiatora musi mieścić się w obudowie.'], parameters: { 'Elementy': 'radiator, ciepłowody, wentylator', 'Ograniczenie montażowe': 'wysokość radiatora i miejsce wokół gniazda' } },
      { id: 'aio', name: 'Wodne AIO', tagline: 'Zamknięty obieg cieczy przenosi ciepło do radiatora.', description: { noob: 'Ciecz krąży między blokiem na procesorze a radiatorem z wentylatorami.', expert: 'AIO to fabrycznie zamknięty układ cieczowy z blokiem-pompą, przewodami i radiatorem; wymaga miejsca na montaż radiatora.' }, facts: ['AIO zawiera pompę, blok wodny, przewody i radiator.', 'Rozmiar radiatora określa jego zgodność z miejscem montażowym obudowy.', 'AIO nadal wymaga wentylatorów do chłodzenia radiatora.'], parameters: { 'Elementy': 'blok-pompa, przewody, radiator, wentylatory', 'Ograniczenie montażowe': 'rozmiar i położenie radiatora' } },
      { id: 'custom-loop', name: 'Wodne z obiegiem własnym', tagline: 'Rozbudowany obieg cieczy dopasowany do konfiguracji komputera.', description: { noob: 'Użytkownik sam dobiera pompę, rurki, zbiornik i chłodnice. Taki układ może chłodzić kilka części.', expert: 'Custom loop składa się z dobieranych osobno bloków, pompy, rezerwuaru, przewodów i chłodnic; wymaga montażu, napełniania i okresowej kontroli.' }, facts: ['Obieg własny może chłodzić CPU i GPU.', 'Pompa wymusza przepływ cieczy przez układ.', 'Układ wymaga sprawdzenia szczelności i okresowej konserwacji.'], parameters: { 'Elementy': 'bloki, pompa, rezerwuar, przewody, chłodnice', 'Priorytet': 'elastyczność konfiguracji' } },
    ],
  },
  RAM: {
    title: 'Pamięć RAM',
    tagline: 'Przechowuje tymczasowo dane, z których komputer korzysta w danej chwili.',
    description: {
      noob: 'RAM to szybki, tymczasowy blat roboczy komputera. Po wyłączeniu komputera jego zawartość znika.',
      expert: 'DRAM przechowuje aktywne dane i instrukcje; jest pamięcią ulotną, a jej generacja musi być obsługiwana przez procesor i płytę główną.',
    },
    facts: ['RAM jest pamięcią ulotną i traci zawartość po odłączeniu zasilania.', 'Większa pojemność pozwala przechowywać więcej aktywnych danych.', 'Typ pamięci musi być zgodny z płytą główną i procesorem.'],
    types: [
      { id: 'ddr4', name: 'DDR4', tagline: 'Powszechna generacja pamięci operacyjnej.', description: { noob: 'Starszy z dwóch pokazanych typów RAM. Działa tylko z płytą i procesorem obsługującymi DDR4.', expert: 'DDR4 to czwarta generacja Double Data Rate SDRAM; moduły DDR4 mają inne wycięcie niż DDR5 i nie są z nią zamienne.' }, facts: ['Modułu DDR4 nie można włożyć do slotu DDR5.', 'Obsługę DDR4 musi zapewniać procesor i płyta główna.'], parameters: { 'Generacja': 'DDR4', 'Zgodność': 'płyta główna i procesor obsługujące DDR4' } },
      { id: 'ddr5', name: 'DDR5', tagline: 'Nowsza generacja pamięci z inną platformą i modułem.', description: { noob: 'Nowszy typ RAM. Potrzebuje płyty głównej i procesora zgodnych z DDR5.', expert: 'DDR5 to piąta generacja Double Data Rate SDRAM; różni się organizacją i zasilaniem modułu od DDR4 oraz nie jest z nią kompatybilna.' }, facts: ['Moduły DDR5 nie są zgodne ze slotami DDR4.', 'Obsługę DDR5 musi zapewniać procesor i płyta główna.', 'Rzeczywista szybkość pracy zależy od obsługi platformy i ustawień pamięci.'], parameters: { 'Generacja': 'DDR5', 'Zgodność': 'płyta główna i procesor obsługujące DDR5' } },
    ],
  },
  GPU: {
    title: 'Karta graficzna',
    tagline: 'Przygotowuje obraz, który trafia na ekran.',
    description: {
      noob: 'GPU tworzy obraz w grach i programach. Może być częścią procesora albo osobną kartą.',
      expert: 'GPU wykonuje równoległe obliczenia graficzne, a karta graficzna łączy układ GPU z pamięcią, zasilaniem i wyjściami obrazu.',
    },
    facts: ['GPU wykonuje obliczenia związane z grafiką.', 'Dedykowana karta graficzna ma własną pamięć wideo.', 'Zintegrowana grafika korzysta z zasobów procesora i pamięci systemowej.'],
    types: [
      { id: 'integrated', name: 'Zintegrowana (iGPU)', tagline: 'Układ graficzny wbudowany w procesor lub system-on-chip.', description: { noob: 'Grafika jest częścią głównego układu komputera. Nie wymaga osobnej dużej karty.', expert: 'iGPU współdzieli pamięć systemową i limit mocy platformy; jego dostępność zależy od konkretnego CPU lub SoC.' }, facts: ['iGPU zwykle korzysta z pamięci systemowej.', 'Nie każdy procesor ma zintegrowany układ graficzny.', 'Wydajność iGPU zależy od modelu układu oraz konfiguracji pamięci.'], parameters: { 'Pamięć graficzna': 'współdzielona pamięć systemowa', 'Montaż': 'zintegrowana z CPU lub SoC' } },
      { id: 'dedicated', name: 'Dedykowana', tagline: 'Osobna karta z własnym układem i zwykle własną pamięcią wideo.', description: { noob: 'Oddzielna karta do obrazu i gier. Ma własną pamięć i podłącza się ją do płyty głównej.', expert: 'Dedykowana karta GPU jest zwykle instalowana w slocie PCIe x16, ma własną pamięć VRAM i może wymagać dodatkowych przewodów zasilających.' }, facts: ['Dedykowana karta ma własną pamięć VRAM.', 'Karta wymaga odpowiedniego slotu i miejsca w obudowie.', 'Wymagania zasilania zależą od modelu karty.'], parameters: { 'Pamięć graficzna': 'własna VRAM', 'Interfejs': 'zwykle PCIe x16', 'Zasilanie': 'zależne od modelu' } },
    ],
  },
  SSD: {
    title: 'Dysk',
    tagline: 'Przechowuje system, programy i pliki także po wyłączeniu komputera.',
    description: {
      noob: 'Dysk to trwały magazyn komputera. Zapisane na nim pliki zostają po wyłączeniu zasilania.',
      expert: 'Pamięć masowa przechowuje dane nieulotnie; technologia nośnika i interfejs wpływają na przepustowość, opóźnienia, pojemność i cenę.',
    },
    facts: ['Dysk przechowuje dane po wyłączeniu komputera.', 'HDD zapisuje dane magnetycznie na talerzach.', 'SSD zapisuje dane w pamięci flash i nie ma ruchomych talerzy.', 'NVMe jest protokołem pamięci masowej używanym zwykle przez PCIe.'],
    types: [
      { id: 'hdd', name: 'HDD (talerzowy)', tagline: 'Tani i pojemny nośnik z obracającymi się talerzami.', description: { noob: 'Dane są zapisywane magnetycznie na obracających się talerzach. HDD często oferuje dużo miejsca za niewielką cenę, ale jest wolniejszy od SSD.', expert: 'HDD wykorzystuje talerze magnetyczne i ruchomą głowicę; typowe prędkości obrotowe to 5400 lub 7200 obr./min, a losowy dostęp ograniczają opóźnienia mechaniczne.' }, facts: ['HDD zapisuje dane magnetycznie na obracających się talerzach.', 'HDD zawiera ruchome części i jest wrażliwszy na wstrząsy podczas pracy niż SSD.', 'Typowe prędkości obrotowe to 5400 lub 7200 obr./min.', 'Wewnętrzne dyski HDD komputerowe często używają interfejsu SATA.'], parameters: { 'Nośnik': 'talerze magnetyczne', 'Interfejs typowy': 'SATA', 'Prędkość obrotowa typowa': '5400 lub 7200 obr./min', 'Zachowanie': 'wyższe opóźnienia dostępu losowego niż SSD' } },
      { id: 'sata-ssd', name: 'SSD SATA', tagline: 'Półprzewodnikowy dysk korzystający z interfejsu SATA.', description: { noob: 'SSD bez ruchomych części. Jest szybki przy uruchamianiu programów, ale ogranicza go starszy interfejs SATA.', expert: 'SATA SSD wykorzystuje pamięć flash i protokół ATA przez SATA; przepustowość interfejsu SATA 6 Gb/s ogranicza transfer do około 550 MB/s w praktyce.' }, facts: ['SSD zapisuje dane w pamięci flash.', 'SSD nie ma ruchomych talerzy ani głowicy.', 'SATA SSD używa interfejsu SATA.', 'Praktyczny transfer SATA SSD jest ograniczany przez interfejs SATA 6 Gb/s.'], parameters: { 'Nośnik': 'pamięć flash', 'Interfejs': 'SATA 6 Gb/s', 'Odczyt sekwencyjny typowy': 'do około 550 MB/s', 'Format': '2,5 cala lub M.2 SATA' } },
      { id: 'nvme-ssd', name: 'SSD M.2 NVMe', tagline: 'Kompaktowy dysk SSD korzystający z protokołu NVMe przez PCIe.', description: { noob: 'Mały dysk wpinany bezpośrednio do płyty. NVMe przez PCIe może przesyłać dane znacznie szybciej niż SATA.', expert: 'M.2 opisuje format modułu, a NVMe — protokół; dysk komunikuje się przez linie PCIe, a osiągana przepustowość zależy od generacji i liczby linii.' }, facts: ['M.2 jest formatem złącza i modułu, a nie nazwą protokołu.', 'NVMe jest protokołem pamięci masowej używanym przez PCIe.', 'Prędkość dysku zależy od generacji PCIe, liczby linii i kontrolera.', 'Nie każde gniazdo M.2 obsługuje NVMe.'], parameters: { 'Nośnik': 'pamięć flash', 'Format typowy': 'M.2 2280', 'Protokół': 'NVMe', 'Interfejs': 'PCIe; prędkość zależy od generacji i liczby linii' } },
    ],
  },
  PSU: {
    title: 'Zasilacz',
    tagline: 'Dostarcza podzespołom energię o odpowiednim napięciu.',
    description: {
      noob: 'Zasilacz pobiera prąd z gniazdka i dostarcza komputerowi energię potrzebną do działania.',
      expert: 'PSU przekształca napięcie sieciowe AC na regulowane szyny DC i rozprowadza je do komponentów; dobór uwzględnia moc, złącza i jakość jednostki.',
    },
    facts: ['Zasilacz przekształca prąd przemienny z sieci na prąd stały używany przez komputer.', 'Zasilacz musi mieć odpowiednie złącza dla płyty i karty graficznej.', 'Wymaganą moc określa konfiguracja i jej pobór energii.'],
    types: [
      { id: 'atx-psu', name: 'ATX', tagline: 'Standardowy rozmiar zasilacza do wielu komputerów stacjonarnych.', description: { noob: 'Typowy zasilacz do komputera stacjonarnego. Przed zakupem trzeba sprawdzić, czy zmieści się w obudowie.', expert: 'Zasilacz ATX korzysta ze standardu wymiarów i złączy ATX; zgodność długości jednostki i okablowania zależy od obudowy oraz modelu PSU.' }, facts: ['Zasilacz ATX jest częstym formatem w komputerach stacjonarnych.', 'Moc, sprawność i dostępne przewody różnią się między modelami.', 'Wymiary zasilacza muszą pasować do obudowy.'], parameters: { 'Format': 'ATX', 'Moc': 'dobierana do konfiguracji', 'Okablowanie': 'stałe, częściowo lub w pełni modularne zależnie od modelu' } },
      { id: 'sfx-psu', name: 'SFX', tagline: 'Mniejszy zasilacz przeznaczony do kompaktowych obudów.', description: { noob: 'Mniejszy zasilacz do małych komputerów. Często można go zamontować z adapterem w większej obudowie.', expert: 'SFX to kompaktowy format PSU; przed montażem trzeba sprawdzić obsługiwany format, długość zasilacza i miejsce na przewody.' }, facts: ['SFX jest mniejszym formatem niż typowy ATX PSU.', 'Nie każda obudowa obsługuje SFX bez adaptera.', 'Kompaktowy rozmiar może ograniczać wybór mocy i poziom hałasu zależnie od modelu.'], parameters: { 'Format': 'SFX', 'Zastosowanie': 'kompaktowe zestawy', 'Zgodność': 'obudowa obsługująca SFX lub odpowiedni adapter' } },
    ],
  },
  Mouse: {
    title: 'Mysz',
    tagline: 'Zamienia ruch dłoni i kliknięcia na polecenia dla komputera.',
    description: {
      noob: 'Mysz pozwala poruszać wskaźnikiem i wybierać rzeczy na ekranie.',
      expert: 'Mysz mierzy ruch względem powierzchni za pomocą sensora optycznego lub laserowego i wysyła dane wejściowe przez przewód albo łącze bezprzewodowe.',
    },
    facts: ['Sensor myszy mierzy ruch względem powierzchni.', 'Przyciski myszy wysyłają zdarzenia kliknięcia.', 'Mysz przewodowa przesyła dane i może pobierać zasilanie przez przewód.'],
    types: [
      { id: 'wired', name: 'Przewodowa', tagline: 'Łączy się z komputerem przewodem.', description: { noob: 'Mysz połączona kablem. Nie trzeba pamiętać o ładowaniu baterii.', expert: 'Mysz przewodowa przesyła sygnał przez USB lub inny przewodowy interfejs; opóźnienie zależy od urządzenia i ustawień raportowania.' }, facts: ['Przewodowa mysz nie wymaga osobnej baterii, jeśli jest zasilana przez interfejs.', 'Kabel może ograniczać swobodę ruchu.'], parameters: { 'Połączenie': 'przewód, zwykle USB', 'Zasilanie': 'zwykle przez przewód' } },
      { id: 'wireless', name: 'Bezprzewodowa', tagline: 'Wysyła sygnał bez kabla, zwykle przez Bluetooth lub odbiornik USB.', description: { noob: 'Mysz łączy się z komputerem bez przewodu. Zwykle potrzebuje baterii lub ładowania.', expert: 'Mysz bezprzewodowa komunikuje się przez Bluetooth lub dedykowany odbiornik radiowy; wymaga źródła energii i sparowania z komputerem.' }, facts: ['Mysz bezprzewodowa wymaga baterii lub akumulatora.', 'Typ połączenia zależy od modelu.', 'Bluetooth i odbiornik USB to różne sposoby łączności.'], parameters: { 'Połączenie': 'Bluetooth lub odbiornik radiowy USB', 'Zasilanie': 'bateria lub akumulator' } },
    ],
  },
  Monitor: {
    title: 'Monitor',
    tagline: 'Zamienia sygnał obrazu z komputera na obraz widoczny dla użytkownika.',
    description: {
      noob: 'Monitor pokazuje tekst, zdjęcia i filmy. Karta graficzna wysyła do niego sygnał obrazu.',
      expert: 'Monitor odbiera sygnał cyfrowy przez wejście obrazu i steruje pikselami panelu; jakość zależy m.in. od panelu, rozdzielczości i częstotliwości odświeżania.',
    },
    facts: ['Monitor wyświetla obraz otrzymany z komputera.', 'Rozdzielczość określa liczbę pikseli obrazu.', 'Częstotliwość odświeżania określa liczbę aktualizacji obrazu na sekundę.', 'Rodzaj panelu wpływa na kontrast, kolory i kąty widzenia.'],
    types: [
      { id: 'ips', name: 'Panel IPS', tagline: 'Panel LCD znany z szerokich kątów widzenia i stabilnych kolorów.', description: { noob: 'Obraz wygląda podobnie także wtedy, gdy patrzysz na ekran z boku.', expert: 'IPS to odmiana LCD oferująca szerokie kąty widzenia i dobrą stabilność kolorów; kontrast natywny zwykle jest niższy niż w OLED.' }, facts: ['IPS jest technologią panelu LCD.', 'Panele IPS zwykle mają szerokie kąty widzenia.', 'Częstotliwość odświeżania zależy od konkretnego monitora, a nie od samej technologii IPS.'], parameters: { 'Technologia': 'LCD IPS', 'Częstotliwość odświeżania': 'zależna od modelu; spotykane są 60 Hz i 144 Hz' } },
      { id: 'oled', name: 'Panel OLED', tagline: 'Każdy piksel świeci samodzielnie, co pozwala uzyskać głęboką czerń.', description: { noob: 'Każdy punkt obrazu świeci sam. Gdy ma pokazać czerń, może zostać wyłączony.', expert: 'OLED wykorzystuje samoemisyjne piksele, umożliwiając bardzo wysoki kontrast i szybki czas reakcji; długotrwałe wyświetlanie statycznych elementów może powodować nierównomierne zużycie.' }, facts: ['Piksele OLED emitują własne światło.', 'Wyłączony piksel OLED może wyświetlić czerń.', 'Długotrwałe statyczne obrazy mogą przyczyniać się do nierównomiernego zużycia panelu.', 'Częstotliwość odświeżania zależy od konkretnego monitora.'], parameters: { 'Technologia': 'OLED', 'Kontrast': 'bardzo wysoki dzięki możliwości wyłączania pikseli', 'Częstotliwość odświeżania': 'zależna od modelu; spotykane są 60 Hz i 144 Hz' } },
    ],
  },
};
