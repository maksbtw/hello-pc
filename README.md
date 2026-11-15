# PC Workshop

An interactive 3D encyclopedia that shows how a computer works: explore real-looking PC parts
in 3D and follow your own text on its journey through the hardware.

Started at HackYeah 2026. Name and domain are not final.

---

## Audience and tone

- **For curious beginners and students** with no prior knowledge.
- **One depth level everywhere**: explain *what happens and why*, neither childish nor expert.
  No Basics/Expert switch.
- Visuals explain first, text supports them.

## Languages

- **Polish and English.** Every UI text and all content exist in both.
- First visit: the browser language decides (Polish browser → Polish, everything else → English).
- A **PL | EN switch** in the top bar; the choice is remembered.
- All texts live in typed `pl` / `en` dictionaries. A missing translation is a build error.
- Code, comments and READMEs are in English only.

## Structure

| Page | What it is |
|---|---|
| **Landing** (`/`) | Small: 3 screen-height sections only — hero, what's inside, who made it |
| **Explore** | The 3D PC. Click a part → description, types, facts, parameters |
| **Journeys** | Step-by-step simulations |
| **Concepts** | Glossary of ideas (binary, bytes, clock speed, cache…) |
| **About** | Team, credits, Buy Me a Coffee |

## Explore

- Parts: CPU, GPU, RAM, storage, cooling, PSU, motherboard, case, monitor.
- Each part has **types** (2–4): technology variants, **not brands**
  (e.g. storage → HDD / SSD SATA / SSD M.2 NVMe).
- Each part and type has: name, tagline, description, short facts, parameters.
- **Fact rule:** short atomic sentences, one fact per sentence, no marketing.

## Journeys

- **Flagship journey "Keyboard → Screen"**: the user types a short text and follows it through
  the computer. Data changes form on the way: **characters → bytes → bits → pixels**.
  - Starts with a **Keyboard** step (key press → key code → USB → the computer receives it).
  - Between steps, data is shown traveling over the **motherboard "roads"** (buses).
  - Steps: Keyboard → SSD → RAM → CPU (decode) → CPU (text as numbers) → GPU (raster) → Monitor.
- **Per-part journeys**: one for each part, about what happens *inside* it
  (e.g. how an SSD stores a bit, how a PSU turns wall power into 12 V).
- The UTF-8 step shows language-specific examples: `ą` / `ł` in Polish, `é` in English, an emoji in both.

## Visual identity

### Palette: "PCB"

Neutral near-black graphite, a dark green-gray accent like a circuit board, cold white light.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#09090B` | App background |
| `bg-2` | `#0E0E11` | Deeper layer |
| `panel` | `#131316` | Panels |
| `surface` | `#1A1A1F` | Cards, inputs |
| `surface-raised` | `#222228` | Raised cards |
| `surface-overlay` | `#2A2A31` | Hover, overlays |
| `border` | `#26262C` | Lines |
| `border-subtle` | `#2E2E35` | Soft lines |
| `border-strong` | `#3B3B44` | Strong lines |
| `text-bright` | `#FAFAFA` | Headings |
| `text` | `#ECECEF` | Body text |
| `text-soft` | `#CFCFD6` | Softer text |
| `text-muted` | `#A1A1AA` | Secondary text |
| `text-dim` | `#81818B` | Weak text |
| `text-faint` | `#63636D` | Faintest text |
| `accent` | `#26392F` | PCB green: buttons, active states, fills |
| `accent-hover` | `#1E2E26` | Accent hover |
| `accent-bright` | `#33493D` | Lighter accent fill |
| `accent-ink` | `#7FA592` | Accent used as text, icons, borders |
| `accent-on` | `#F2F7F4` | Text on accent fills |
| `accent-subtle` | `#0B1A13` | Dark accent background |
| `lamp` | `#C9DAF2` | Lamp light (cold white) |
| `lamp-soft` | `#E6EEF8` | Lamp bulb / brightest glow |

**Data colors** (fixed teaching code in all journeys):

| Token | Hex | Meaning |
|---|---|---|
| `data-text` | `#4ADE80` | Characters / text |
| `data-bytes` | `#60A5FA` | Bytes |
| `data-bits` | `#A78BFA` | Bits |
| `data-instructions` | `#F472B6` | CPU instructions |

**States:** success `#4ADE80` · info `#60A5FA` · warning `#FBBF24` · error `#F87171`.

### Fonts

**Outfit** (headings, weight 600) · **Inter** (UI) · **JetBrains Mono** (code, bytes). Self-hosted.

### Consistency rules

- The app must look like one product on every screen.
- Only tokens: no raw hex values, no sizes or radii outside the scale.
- Shared components for buttons, switches, panels, labels and hints. No one-off versions.
- One lamp component, one 3D viewer, one motion style for the whole app.

## 3D models

- Must look **realistic**: the user should see a real part, not a toy.
- **No brand models or renders** (copyright and trademarks). Realistic unbranded parts only.
- One `.glb` per part in `frontend/public/models/`. Node names:
  `Case, Motherboard, CPU, Cooler, RAM, GPU, SSD, PSU, Monitor`.
  Details: `frontend/public/models/README.md`.

## Platform

- **Desktop only** (1280 px and wider). Smaller screens get a branded "open on a computer" page.
- **Static site**, no backend: everything is computed in the browser.
- **Analytics:** cookie-free, no cookie banner. Events: journey started, step reached,
  journey finished, Buy Me a Coffee clicked.
- **No AI**, no accounts, no ads.

## Money

**Buy Me a Coffee only**, placed politely: footer, About page, and one line at the end of each
journey. Never interrupts learning.

## Not decided yet

- Final name and domain.
- Where the realistic 3D models come from.

---

## Run locally

Requires **Node.js (LTS)**.

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Stack: Vite, React, TypeScript, Tailwind, React Router, Zustand, react-three-fiber.
