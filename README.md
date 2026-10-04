# PC Workshop

## Quick start (Linux and macOS)

Install and start **Docker with Docker Compose** and install **[Homebrew](https://brew.sh/)**
if you do not already have them. Download or clone this repository and open a terminal
in its root folder (the folder containing `compose.yaml`). No local Node.js, Java,
or Maven installation is needed for this Docker setup.

**1. Set up the local AI once.** This installs llama.cpp, connects its server binary
to the path expected by our launcher, and downloads the default Qwen3 model (~5 GB):

```bash
brew install llama.cpp
mkdir -p "$HOME/.local/bin" "$HOME/.local/share/llama.cpp/models"
if [ ! -e "$HOME/.local/bin/llama-server" ] && [ ! -L "$HOME/.local/bin/llama-server" ]; then
  ln -s "$(command -v llama-server)" "$HOME/.local/bin/llama-server"
fi
curl -fL --retry 3 \
  -o "$HOME/.local/share/llama.cpp/models/Qwen3-8B-Q4_K_M.gguf" \
  "https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/Qwen3-8B-Q4_K_M.gguf"
```

Homebrew supports both Linux and macOS. See the
[llama.cpp installation guide](https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md)
and [official model files](https://huggingface.co/Qwen/Qwen3-8B-GGUF/tree/main).
Allow additional memory for inference and Docker; the model file size is not the
total memory requirement. The first setup and Docker build require internet access.

**2. Start the local AI** from the project root:

```bash
./scripts/run-local-llama.sh
```

Wait until the model finishes loading and keep this terminal open.

**3. In a second terminal, start the application** from the project root:

```bash
docker compose up --build -d
```

Open **[http://localhost:5174](http://localhost:5174)** once the services have started.
The backend runs on port `8080` and the local AI server on port `8081`.
These ports and `5174` must be available. The launcher binds the AI server to
`0.0.0.0` so Docker can reach it on Linux; this also makes it reachable from your network.

For later runs, repeat only steps **2–3**. After the model and Docker images are
downloaded and built, the application can run offline.

To stop the application, run `docker compose down`, then press **Ctrl+C** in the
AI terminal. For application logs, run `docker compose logs -f`.

---

Interaktywna encyklopedia 3D komputera z lokalnym AI. Klikasz część, wybierasz jej typ,
czytasz opis na swoim poziomie, a AI odpowiada na pytania wyłącznie na podstawie
naszej kuratorowanej wiedzy (bez zmyślania).

**Kategoria hackathonu:** Open Task — Artificial Intelligence.
Zgłoszenie, prezentacja i deck po **angielsku**.

> Ten README to jednocześnie plan i instrukcja. Każdy znajdzie swoją sekcję w [Podziale pracy](#podział-pracy).

---

## 1. Model informacji — trzy wymiary

1. **Część** — CPU, GPU, RAM, Dysk, Chłodzenie, Zasilacz, Płyta główna, Obudowa, Mysz, Monitor.
2. **Typ** — wariant technologiczny wewnątrz części, 2–4 na część. Np. Dysk → HDD / SSD SATA / SSD M.2 NVMe. **Nie marki — typy technologiczne.**
3. **Poziom** — noob / expert (steruje sposobem tłumaczenia tego samego tematu).

**Infrastruktura demo:** WiFi hackathonu izoluje urządzenia → demo na **JEDNYM Macu M4/24GB**, wszystko na `localhost`. Zero sieci.

---

## 2. Propozycja typów per część

- **Dysk (SSD):** HDD · SSD SATA · SSD M.2 NVMe (3)
- **RAM:** DDR4 · DDR5
- **GPU (Karta graficzna):** Zintegrowana (iGPU) · Dedykowana
- **CPU (Procesor):** Desktopowy · Laptopowy (mobilny) · Serwerowy
- **Zasilacz (PSU)**
- **Płyta główna:** ATX · microATX · Mini-ITX
- **Obudowa + chłodzenia**
- **Monitor:** Panel IPS vs OLED, 60 vs 144 Hz

---

## 3. Dwa tryby aplikacji

Aplikacja działa w dwóch trybach, między którymi użytkownik się przełącza.

### Tryb Demo (eksploracja)
Zaglądamy do wnętrza komputera — można obracać modele 3D i wybierać różne typy komponentów.
Po kliknięciu dowolnego modelu (np. RAM-u) ekran dzieli się w proporcji **2:1**: po lewej model 3D,
po prawej tekst — opis komponentu. Mały guzik otwiera **czat z AI**, w którym można zadać pytanie
do aktualnie wybranego komponentu. Zmiana typu komponentu zmienia wyświetlane informacje (opis + dane).
To tryb interaktywnej encyklopedii.

> **Czat z AI jest tylko w trybie Demo.** Buduje go Anton (patrz [Podział pracy](#podział-pracy)).

### Tryb Symulacja
Pokazuje przepływ — jak dane/sygnał wędrują przez komputer. Modele są **domyślne i nie można
zmieniać ich typów** (są takie jak wybrane w trybie Demo do pokazu; dodatkowe typy komponentów
istnieją tylko w Demo jako opcje do zapoznania). **Brak wyboru poziomu — jeden, domyślny sposób
objaśniania.** Użytkownik obserwuje przepływ krok po kroku.

**Jak to działa:** użytkownik wpisuje krótki tekst (np. „Hello") i klika „Wyślij". Aplikacja pokazuje,
co dzieje się z tym tekstem wewnątrz komputera — krok po kroku przez kolejne podzespoły: od wpisania
(mysz/klawiatura), przez dysk, pamięć RAM, procesor, kartę graficzną, aż po wyświetlenie na ekranie.
Na każdym kroku widać, jak dane zmieniają postać: **znak → bajty → zera i jedynki → piksele.**
Każdy etap jest krótko opisany i podświetlony odpowiednim kolorem danych (tekst, bajty, bity, instrukcje).

To tryb „zajrzyj pod maskę" — pokazuje w prosty, wizualny sposób, że za jednym słowem na ekranie
stoi cała podróż danych przez sprzęt.

---

## 4. Treści — przykład i zasada

Każda część i typ ma opisy na poziomach + listę faktów dla AI.

**Przykład — Dysk (SSD):**
- noob: „Dysk to magazyn — tu zostają Twoje pliki, gdy wyłączysz komputer."
- expert: „Pamięć nieulotna; różnice w nośniku i interfejsie (SATA vs NVMe/PCIe) decydują o przepustowości i opóźnieniach."

Typy: HDD, SSD SATA, SSD M.2 NVMe.

**Przykładowy typ HDD:**
- **nazwa:** „HDD (talerzowy)"
- **tagline:** „Tani, pojemny, wolny — dane na obracających się talerzach."
- **opis noob:** „Stary typ dysku z ruchomymi częściami. Dużo miejsca za mało pieniędzy, ale wolny."
- **opis expert:** „Nośnik magnetyczny, prędkości 5400/7200 obr/min, interfejs SATA. Wysokie opóźnienia dostępu losowego przez ruch głowicy."
- **fakty:** HDD zapisuje dane magnetycznie na obracających się talerzach; ma ruchome części, więc jest wrażliwy na wstrząsy; najtańszy koszt za gigabajt, ale najwolniejszy z typów dysków; typowe prędkości obrotowe to 5400 lub 7200 obr/min.
- **parametry:** interfejs — SATA; prędkość odczytu — ~100–200 MB/s; koszt/GB — najniższy.

Pozostałe typy wypełniamy analogicznie.

**Zasada pisania faktów:** krótkie, atomowe zdania (1 fakt = 1 zdanie), bez marketingu.
To materiał, z którego AI buduje odpowiedzi — im czystsze fakty, tym mniej halucynacji.

---

## 5. Model danych komunikacji z AI

JSON wysyłany do AI zawiera:
- pytanie użytkownika dotyczące konkretnej części,
- specyfikację omawianego komponentu,
- opis, który widział użytkownik i do którego ma pytanie.

AI odpowiada wyłącznie na podstawie tych danych.

---

## Podział pracy

Max i Anton pracują na **osobnych podfolderach frontendu** i tworzą osobne strony/trasy,
żeby unikać konfliktów w gicie.

### Denis — backend + AI (`backend/`)
- Lokalny LLM działający pod `http://127.0.0.1:8081`.
- Endpoint do dynamicznych odpowiedzi na pytania użytkownika.
- Endpoint do liczenia bajtów tekstu wysłanego przez użytkownika.
- Cache odpowiedzi dla demo aplikacji.

### Max — scena 3D (`frontend/src/three/`)
- Przygotowanie sceny 3D komputera.
- Dodanie modeli.
- Możliwość obracania i przybliżania widoku.
- Obsługa kliknięcia podzespołu i podświetlenie wybranej części.
- Przekazanie opisu i pytań do AI, jeśli użytkownik będzie je miał.
- Zapewnienie działania sceny lokalnie i offline.
- Cała część Demo (oprócz tworzenia statycznych opisów).

### Anton — tryb Symulacja + treści + czat AI (`frontend/src/`)
- Cały tryb Symulacja.
- Ekran wpisywania tekstu do AI (czat w trybie Demo).
- Wysłanie tekstu do backendu i odebranie wyniku.
- Pokazanie przepływu danych przez komputer krok po kroku.
- Nawigacja między krokami (dalej / wstecz).
- Opisy wszystkich części i typów — zarówno dla Symulacji, jak i Demo.

---

## Uruchamianie

Wymagania: **Node.js (LTS)** — frontend · **JDK 21** — backend · lokalny LLM na `127.0.0.1:8081`.

```bash
npm run setup   # instalacja zależności frontendu
npm run dev     # frontend (5173) + backend (8080) naraz
```

Osobno:

```bash
npm run dev:front   # tylko frontend → http://localhost:5173
npm run dev:back    # tylko backend  → http://localhost:8080
```

Frontend woła backend przez proxy Vite: `/api → http://localhost:8080` (bez problemów z CORS).
Jeśli backend nie odpowiada, klient zwraca mock i pokazuje baner.

**Demo działa wyłącznie lokalnie i offline** — bez zewnętrznych serwisów, baz danych i CDN-ów.

---

## Backend / API

- **Lokalny LLM:** `http://127.0.0.1:8081` (odpowiedzi AI).
- **Odpowiedzi AI** — dynamiczne odpowiedzi na pytania o wybrany komponent (patrz [Model danych komunikacji z AI](#5-model-danych-komunikacji-z-ai)).
- **Liczenie bajtów** — przekształcenie tekstu użytkownika w kolejne postacie danych (dla trybu Symulacja).
- **Cache** odpowiedzi dla stabilnego demo.

Tryb Symulacja pokazuje 7 kroków przepływu (mysz → dysk → RAM → CPU → kodowanie → GPU → monitor).
Kontrakt kroków i mock znajdują się w `frontend/src/types/api.ts` oraz `frontend/src/mocks/`.

---

## Konwencja modeli 3D

Jeden plik `.glb` na część w `frontend/public/models/`. Nazwy node'ów:
`Case, Motherboard, CPU, Cooler, RAM, GPU, SSD, PSU, Mouse, Monitor`.
Szczegóły: `frontend/public/models/README.md`.

---

## Design system

Ciemny motyw z pomarańczowym akcentem, wyciągnięty z Figmy. Tokeny żyją w dwóch miejscach:
- `frontend/tailwind.config.ts` — klasy Tailwind (`bg-surface`, `text-accent`, `border-border-strong`, `rounded-md`, `font-heading`…).
- `frontend/src/index.css` — te same wartości jako zmienne CSS (`var(--accent)`, `var(--surface)`…) do użycia poza Tailwindem (scena 3D, inline style).

Fonty (lokalne, zero requestów): **Space Grotesk** (nagłówki), **Inter** (UI), **JetBrains Mono** (kod/bajty).
Używajcie tokenów semantycznych zamiast surowych hexów — spójność punktuje w ocenie (Design 20%).

---

## Struktura

```
/
├─ frontend/   Vite + React + TS, Tailwind, React Router, Zustand, react-three-fiber, GSAP
├─ backend/    Java 21 + Spring Boot 3.x, Maven (mvnw), bez bazy danych
├─ package.json  skrypty uruchamiające całość (concurrently)
└─ README.md
```
