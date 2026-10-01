# PC Workshop

Webowa aplikacja (tylko desktop), która uczy, jak działa komputer:

1. **Eksploracja** — model komputera 3D (`.glb`), klikanie części, opisy na 3 poziomach (noob / mid / expert).
2. **Symulacja** — użytkownik wpisuje tekst (max 12 znaków), backend liczy prawdziwe
   przekształcenia danych (UTF-8, binarnie, siatka pikseli…), a frontend pokazuje je krok po kroku (7 kroków).

Demo działa **wyłącznie lokalnie i offline** — bez zewnętrznych serwisów, baz danych, CDN-ów i API z limitami.

> To jest **szkielet**: wszystko się uruchamia i jest połączone end-to-end, ale ekrany i logika to placeholdery.
> Każdy członek zespołu układa wewnętrzną strukturę swojej części sam.

## Wymagania

- **Node.js** (LTS) — frontend
- **JDK 21** — backend (np. `brew install openjdk@21`)

## Uruchamianie (jedną komendą)

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
Jeśli backend nie odpowiada, klient zwraca mock z »Hello« i pokazuje baner.

## Struktura

```
/
├─ frontend/   Vite + React + TS (strict), Tailwind, React Router, Zustand, react-three-fiber, GSAP
├─ backend/    Java 21 + Spring Boot 3.x, Maven (mvnw), bez bazy danych
├─ package.json  skrypty uruchamiające całość (concurrently)
└─ README.md
```

## Kontrakt API

Ten sam kształt w: typach TS (`frontend/src/types/api.ts`), rekordach Javy
(`backend/.../model/`) i mocku (`frontend/src/mocks/simulation-hello.json`).

```
GET  /api/health      → { "status": "ok" }
POST /api/simulation  body { "text": string } → SimulationResponse
```

Walidacja: tekst niepusty, max **12 znaków liczonych jako code pointy** (nie `char`!).
Błąd → `400` z `{ "error": "..." }`.

```ts
SimulationResponse { input: string; steps: Step[] }
```

`Step` to unia rozróżniana polem `id` (każdy krok ma też `component`):

| # | id            | component | payload |
|---|---------------|-----------|---------|
| 1 | `mouse`       | `mouse`   | `bytes: number[4]`, `labels: string[4]` |
| 2 | `ssd`         | `ssd`     | `bytes: number[]`, `highlight: [start,end]` |
| 3 | `ram`         | `ram`     | `rows: { address, bytes }[]`, `highlight: [start,end]` |
| 4 | `cpu-decode`  | `cpu`     | `instructions: { address, bytes, asm }[]`, `currentIndex` |
| 5 | `text-encode` | `cpu`     | `chars: { char, bytes, binary }[]` ✅ **w pełni zaimplementowany** |
| 6 | `raster`      | `gpu`     | `width`, `height`, `pixels: number[][]` (0/1) |
| 7 | `display`     | `monitor` | `width`, `height`, `sample: { x, y, rgb }[]` |

Tylko krok **`text-encode`** liczy prawdziwe dane (znaki → bajty UTF-8 → binarnie).
Pozostałe kroki zwracają poprawne strukturalnie dane przykładowe z `// TODO`.
Dopisanie prawdziwej logiki = implementacja w osobnej klasie `StepGenerator`.

## Konwencja modeli 3D

Jeden plik `.glb` na część w `frontend/public/models/`. Nazwy node'ów:
`Case, Motherboard, CPU, Cooler, RAM, GPU, SSD, PSU, Mouse, Monitor`.
Szczegóły: `frontend/public/models/README.md`.

## Kto za co odpowiada

- **Max** — scena 3D (`frontend/src/three/`, modele, eksploracja)
- **Anton** — UI i ekrany symulacji (`frontend/src/` — strony, store, komponenty)
- **Denis** — backend i przekształcenia danych (`backend/` — `StepGenerator`, kolejne kroki)
```
