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

The app is not a set of pages but a **2D table of "points"**, each with its own URL.
A fixed camera flies between them; nothing reloads. Points are grouped into logical zones.

| Zone | Points |
|---|---|
| **landing** (center column) | `/start`, `/about`, `/app` |
| **main journey** (below landing) | `/main-journey` |
| **components** (left) | row 1: `/ram`, `/ssd`, `/gpu`, `/cpu-decode` · row 2: `/hdd` (under SSD), `/cpu-text-as-number` (under CPU) |
| **peripherals** (right) | `/monitor` |

### The three landing points

- **`/start`** — the showcase / business card (hero). The first thing a visitor sees.
- **`/about`** — what this site is and how it works; may include a short recorded demo.
- **`/app`** — the realistic 3D computer and the **main navigation hub**. Every other point is reached from here.

## Navigation

Movement is split in two:

- **Vertical = navigation buttons.** Each point shows up to three buttons (top-right):
  - **up** → the point one level above,
  - **down** → the point one level below,
  - **center** → always back to `/app` (the 3D computer).

  There is **no "forward" button**: going deeper is driven by the content of each point, not by a generic next.
- **Horizontal / into a zone = content.** From `/app` the 3D model leads into the first row of
  **components** and **peripherals**. The second row (`/hdd`, `/cpu-text-as-number`) is reached with
  arrows in the content of the first-row point above it.

### Entering a part from the 3D model

Clicking a part on the `/app` model does **not** fly there immediately. It first shows a short
**info card** about that component with a **"go to component"** button; only then does the camera
travel to the part's point.

### Per-point UI config ("point settings")

Shared UI repeats on every point: the navigation buttons and other common elements. Each point
therefore carries a **declarative config** stating, for every shared element, whether it is active,
where it leads, and what label it shows. The nav buttons are the first case of this; the same config
holds the other repeating UI elements, so they stay consistent across points and are defined in one
place per point.

## Explore (the parts)

- Each component and peripheral is a point reached from the `/app` 3D model.
- A part point explains the part **and** its role in the data journey.
- Parts have **types** (2–4): technology variants, **not brands**
  (e.g. storage → HDD / SSD SATA / SSD M.2 NVMe). A deeper variant dive can live in the second row
  (e.g. `/hdd`).
- Each part and type has: name, tagline, description, short facts, parameters.
- **Fact rule:** short atomic sentences, one fact per sentence, no marketing.

## Main journey

**`/main-journey` — "type a text and follow it through the computer."** The data changes form on
the way: **characters → bytes → bits → pixels**. Its stops are the component/peripheral points, in order:

`/ssd` (read from disk) → `/ram` (load into memory) → `/cpu-decode` (decode instructions) →
`/cpu-text-as-number` (text as numbers, UTF-8) → `/gpu` (rasterization) → `/monitor` (display).

- Between stops, data is shown traveling over the **motherboard "roads"** (buses).
- The UTF-8 stop shows language-specific examples: `ą` / `ł` in Polish, `é` in English, an emoji in both.

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

**Outfit** (headings, weight 600) · **Cabinet Grotesk** (UI, loaded from Fontshare) ·
**Azeret Mono** (code, bytes). Outfit and Azeret Mono are self-hosted.

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

**Buy Me a Coffee only**, placed politely: footer, the `/about` point, and one line at the end of
the main journey. Never interrupts learning.

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
