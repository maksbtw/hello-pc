# AGENTS.md

Zasady pracy nad projektem. Obowiązują ludzi i agentów. Nie zaczynaj żadnej
pracy, zanim nie znasz treści README.md oraz wszystkich trzech plików w docs/.

## Commity

Commit robi wyłącznie człowiek, na jego wyraźne żądanie. Nigdy nie commituj
automatycznie ani „przy okazji" innej zmiany.

## Dokumentacja (docs/)

Trzy pliki, każdy odpowiada tylko za swój zakres zgodny z nazwą:

- **plan.md** — co robimy i podział pracy między Max i Anton.
- **progress.md** — co już zrobione; nagłówki wpisów (H2) to daty.
- **decisions.md** — podjęte decyzje i ich uzasadnienie.

Zasady treści:

- Bez dublowania tej samej informacji między plikami. Gdy trzeba wskazać już
  opisany punkt, podaj odnośnik numerem (np. `decisions.md #3`), nie kopiuj
  tekstu. Dlatego punkty w progress.md i decisions.md numeruj.
- Przy każdej decyzji i każdym punkcie postępu dopisz autora (Max/Anton).
- Pisz zwięźle i konkretnie — minimum tekstu, by rzecz była jasna. Pliki nie
  mają puchnąć.

## Styl dokumentacji

- H1 = tytuł pliku, H2 = sekcja. Głębsze poziomy tylko gdy naprawdę potrzebne.
- Pogrubienie wyłącznie dla etykiet pól (np. **Status:**).
- Bez poziomych linii, ozdobników i dekoracji ASCII.
- Pierwsza linia pod H1: `Aktualizacja: YYYY-MM-DD (Max|Anton)` — data i autor
  ostatniej zmiany pliku. To jedyna data w pliku; nie datuj pól ani statusów.
  Wyjątek: progress.md, gdzie nagłówki wpisów są datami.

## Sekrety

Sekrety nigdy w repo. Tylko w `.env.local` (plik ignorowany przez git).

## Definicja ukończenia (frontend)

Zadanie frontendowe jest gotowe dopiero wtedy, gdy `npm run build` przechodzi
bez błędów.
