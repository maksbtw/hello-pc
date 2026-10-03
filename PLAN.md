# PC Workshop — plan hackathonowy

**Kategoria:** Open Task — ARTIFICIAL INTELLIGENCE (8 000 PLN)
**Pitch w 1 zdaniu:** Interaktywna encyklopedia 3D komputera, w której lokalne AI
tłumaczy każdą część na Twoim poziomie i odpowiada na pytania — bez zmyślania,
bo stoi wyłącznie na naszej kuratorowanej wiedzy.

Zgłoszenie i prezentacja po **angielsku**. Deliverables: opis + deck (PDF) + wideo demo (mp4).

---

## 1. Jak się dogadujemy (ustalcie w 5 min)

- **Jeden kanał** (Discord/Messenger) na szybkie syncy. Nie gadamy w 3 miejscach.
- **Git = jedyne źródło prawdy.** Każdy pushuje na GitHub, Mac 24GB scala.
- **Mac 24GB = maszyna integracyjna + demowa.** Tam `git pull` + odpalenie całości na `localhost`.
- **Sync co ~3h** (albo przy każdym merge): 2 minuty, każdy mówi „zrobione / blokuje mnie X".
- **Kontrakty zamrażamy na starcie** (patrz niżej) — dzięki temu pracujemy równolegle,
  nikt nie czeka na drugiego.

## 2. Zakres (MVP) — co znaczy "gotowe"

Scenariusz demo, pod który wszystko gramy:
> Ktoś, kto nigdy nie składał PC, klika w scenie procesor → czyta prosty opis →
> pisze „a po co mu chłodzenie?" → AI odpowiada na poziomie noob, pokazując źródło.

**Must-have (bez tego nie ma demo):**
- [ ] Scena 3D z klikalnymi częściami (min. 4–5 realnych: CPU, GPU, RAM, SSD, Cooler)
- [ ] Panel części: tytuł + opis na 3 poziomach (noob/mid/expert)
- [ ] „Zapytaj o tę część" → `/api/ask` → Ollama → odpowiedź + sekcja „Źródło"
- [ ] Grounding: AI odpowiada tylko z faktów części; poza zakresem → „Nie mam tego w danych tej części"
- [ ] Warm-up modelu + cache 2–3 pytań na demo (bezpiecznik)

**Nice-to-have (jak zostanie czas):**
- [ ] Streaming tokenów w odpowiedzi
- [ ] Dokończona symulacja (pozostałe kroki poza `text-encode`)
- [ ] Doradca „dobierz PC pod cel"

**Cut (nie robimy):** mobile, logowanie, baza danych, wszystko online.

## 3. Podział pracy + zamrożone interfejsy

### Denis — backend + AI (`backend/`)
- `OllamaClient` → `${OLLAMA_URL:http://localhost:11434}`, model `${OLLAMA_MODEL:llama3.2:3b}`
- `KnowledgeBase` → `resources/parts.json` (te same fakty co front, źródło groundingu)
- `AskController` → `POST /api/ask`
- Prompt + mapowanie poziomów (noob/mid/expert)
- Warm-up przy starcie, cache odpowiedzi

### Max — scena 3D (`frontend/src/three/`)
- Modele `.glb`, klikalne node'y wg nazw z README (Case, Motherboard, CPU, Cooler, RAM, GPU, SSD, PSU, Mouse, Monitor)
- Klik części → `setSelectedPart(name)` w store
- Podświetlenie zaznaczonej części

### Anton — UI + panel AI (`frontend/src/`)
- `selectedPart` w store
- Panel części: opis (na `level`) + pole pytania + odpowiedź + „Źródło"
- Stany: idle / ładowanie / odpowiedź / poza zakresem / błąd (fallback jak istniejący baner)
- Przełącznik poziomu noob/mid/expert

### Kontrakt `/api/ask` (ZAMROŻONY — nie zmieniać bez syncu)
```
POST /api/ask
body { partId: PartName, level: Level, question: string }
→   { answer: string, usedFacts: string[], outOfScope: boolean }
```

### Kształt faktów w `parts.ts` (ZAMROŻONY)
```ts
parts[name] = {
  title: string,
  description: { noob, mid, expert },   // statyczny opis
  facts: string[],                      // grounding dla AI
}
```

## 4. Oś czasu (dopasujcie do realnego zegara)

| Faza | Kto / co |
|---|---|
| **Start (1h)** | Ustalić kanał, zamrozić kontrakty, `ollama pull llama3.2:3b` na Macu, podzielić części do opisania |
| **Blok 1** | Denis: `/api/ask` + Ollama end-to-end (najpierw bez streamingu). Max: 1 klikalna część. Anton: panel + strzał w `/api/ask` |
| **Integracja #1 (Mac)** | Klik → pytanie → odpowiedź działa dla JEDNEJ części. To jest kamień milowy. |
| **Blok 2** | Uzupełnić fakty dla reszty części, dopieścić grounding, dodać „Źródło" i „poza zakresem" |
| **Integracja #2 (Mac)** | Pełny scenariusz demo przechodzi gładko |
| **Polish** | Design (20% oceny!), warm-up, cache, obsługa błędów |
| **STOP FEATURE** | Koniec dodawania. Tylko deck + wideo + próba prezentacji |

**Reguła:** na ~4h przed deadlinem **zamrażamy funkcje** i robimy deck/wideo. Niedokończona
funkcja < działające demo + dobry pitch.

## 5. Deck + wideo (nie zostawiać na koniec!)

Deck (maks ~10 slajdów, ENG), pod kryteria AI:
1. Problem (bariera wejścia w hardware / nauka jak działa PC)
2. Rozwiązanie (encyklopedia 3D + AI przewodnik)
3. **Rola AI** — grounded Q&A, adaptacja poziomu *(Relation to Category 20%)*
4. **Jak user weryfikuje i zachowuje kontrolę** — „Źródło", „poza zakresem" *(wprost z regulaminu)*
5. Demo (screeny / wideo)
6. Tech (React + Three.js + Spring + lokalna Ollama, offline)
7. Co dalej

Wideo (maks 3 min): pokazać scenariusz z p.2 na żywo.

## 6. Ryzyka

- **WiFi hackathonu izoluje urządzenia** → demo na JEDNYM Macu, wszystko localhost. Zero sieci.
- **Zimny start Ollamy** → warm-up przy starcie apki.
- **Ollama zawiesza demo** → cache pre-wygenerowanych odpowiedzi dla pokazywanych części.
- **AI zmyśla** → twardy grounding + „Nie mam tego w danych" zamiast konfabulacji.
- **Model nie w gicie** → na Macu osobno `ollama pull`.

## 7. Co odpala się na Macu demowym

```bash
git pull origin main
ollama pull llama3.2:3b     # raz
ollama serve                # jak nie chodzi w tle
npm run setup               # raz
npm run dev                 # front :5173 + backend :8080
```
