# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious beginners and students with no prior hardware knowledge. They use PC Workshop on their own, at home, at their own pace, on a laptop or desktop. Their job: understand what a computer actually does inside, not memorize specs.

## Product Purpose

An interactive 3D encyclopedia that shows how a computer works. Visitors take apart a realistic 3D PC to see each part and its types, and follow their own text through the hardware. Success: a beginner finishes a journey able to explain, in their own words, how a key press becomes pixels on the screen.

## Positioning

**Your own text's journey.** The visitor types something and watches that exact text travel through real-looking hardware while it changes form: characters → bytes → bits → pixels. A video or an article can describe this; only PC Workshop shows it happening to the visitor's own input. The 3D PC supports this claim; it is not the headline.

## Operating Context

- Solo self-learning at home, not classroom or projector use.
- Desktop only (1280 px and wider). Smaller screens get a branded "open on a computer" page.
- Navigation is a "camera over a table": every URL is a fixed point on a 2D grid of windows, and the camera flies between them. The landing runs downward: Start → What's inside → the 3D PC. Journeys sit in a row under the PC.
- A window's ways out are shown as buttons in a floating top-right pill.

## Capabilities and Constraints

- **Explore:** the 3D PC. Clicking a part opens its panel (description, types, facts, parameters). Parts: CPU, GPU, RAM, storage, cooling, PSU, motherboard, case, monitor, mouse. Types are technology variants, never brands.
- **Journeys:** the flagship "Keyboard → Screen" (Keyboard, SSD, RAM, CPU decode, CPU text as numbers, GPU raster, Monitor). Per-part journeys ("what happens inside") have one window each but are not written yet.
- **Later:** Concepts glossary, About page.
- **Static site:** everything is computed in the browser. No backend, no accounts, no AI, no ads.
- **Languages:** Polish and English everywhere, from typed dictionaries (a missing key fails the build). Browser language decides the first visit; a PL | EN switch is remembered. Not built yet.
- **Depth:** one level everywhere, explaining what happens and why. No beginner/expert split.
- **Fact rule:** short atomic sentences, one fact per sentence, no marketing.
- **Undecided:** final name and domain, the source of realistic 3D models, hosting provider (Cloudflare Pages or Vercel).

## Brand Commitments

- Working name "PC Workshop" (not final). Started at HackYeah 2026.
- 3D models must look realistic and must not show brands, logos or trademarked designs.
- Money only through Buy Me a Coffee, placed politely (footer, About, end of each journey). It never interrupts learning.
- Analytics are cookie-free with no cookie banner.

## Evidence on Hand

- 3D models: `frontend/public/models/` (unbranded parts and variants, described in its README).
- Part content: `frontend/src/data/parts.ts`. Journey step content: `frontend/src/data/steps.ts`.
- No testimonials, user numbers, press or partner logos exist. Do not invent them.

## Product Principles

1. The visitor's own input is the hero. Show their text, not a generic example.
2. Visuals explain first; text supports them.
3. One level of depth, told honestly: simple, never childish, never wrong.
4. Learning is never interrupted, by money, sign-ups or anything else.
5. One product everywhere: every window feels like part of the same table.

## Accessibility & Inclusion

Target WCAG 2.2 AA: contrast, full keyboard navigation, visible focus, screen-reader labels, and `prefers-reduced-motion` respected (camera flights already jump instantly under it).
