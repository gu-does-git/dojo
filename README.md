# Dojo

Japanese language learning drills — interactive grammar practice platform.

## Overview

Dojo is a performance-focused platform for practicing Japanese **grammar** skills through interactive drills. Built with Astro 6 for speed and a polished learning UX.

## Tech Stack

- **Framework**: Astro 6.3 (static-first with interactive islands)
- **Interactivity**: React islands for drill components
- **CSS**: UnoCSS (atomic CSS, on-demand)
- **Fonts**: Astro 6 native font API (Inter + Noto Sans JP)
- **Design**: Modern SaaS — dark mode first, indigo/purple accents
- **Deployment**: `japanese.gudoes.dev`

## Why Astro?

Grammar learning demands speed. Astro's static-first + interactive islands approach:
- Fast initial load (instant for drill pages)
- Hydrate only interactive parts (forms, validation, feedback)
- Excellent mobile UX
- Natural fit for content-driven learning

## Design System

### Colors (CSS custom properties, light/dark)
- **Backgrounds**: `--bg` (white / `#0f0f13`)
- **Surface**: `--surface` (light gray / `#1a1a24`)
- **Accents**: `--accent` (indigo), `--accent2` (purple)
- **Feedback**: `--success` (green), `--error` (red)

### Typography
- Inter (UI/Latin), Noto Sans JP (Japanese)
- Scale: sm/base/xl/3xl/5xl

### Core Components
- `DrillCard` — clickable card per grammar type
- `DrillShell` — wrapper with progress bar + back nav
- `AnswerInput` — validation states
- `FeedbackBanner` — correct/wrong feedback
- `ProgressRing` — session score
- `Badge` — difficulty indicators

## Content: Grammar Drills (MVP)

Current scope: **N5 grammar only**. Extensible for N4–N3.

- **Past Form** (`/drills/past-form`) — Verb conjugation in 過去形
- **Particles** (`/drills/particles`) — は/が/を/に particle usage
- **Negative Form** (future) — 〜ない conjugation
- **Te-Form** (future) — 〜て form drills

No kanji, vocab, or listening in MVP.

## Page Routing

```
/                 → Landing: drill categories grid
/drills           → All available grammar drills
/drills/past-form → Past form drill session
/drills/particles → Particle usage drill session
/404
```

## Data Structure

Drills stored in **Astro Content Collections** (JSON + zod schemas):

```json
{
  "id": "past-form-n5",
  "title": "Past Form — N5 Verbs",
  "level": "N5",
  "type": "conjugation",
  "questions": [
    {
      "prompt": "食べる",
      "romaji": "taberu",
      "answer": "食べた",
      "hint": "Group 2 verb — drop る, add た"
    }
  ]
}
```

## Project Structure

```
src/
├── content/
│   ├── config.ts
│   └── drills/
│       ├── past-form.json
│       └── particles.json
├── components/
│   ├── DrillCard.astro
│   ├── DrillShell.astro
│   └── drills/
│       ├── ConjugationDrill.tsx    (React)
│       └── ParticleDrill.tsx       (React)
├── layouts/
│   ├── BaseLayout.astro
│   └── DrillLayout.astro
└── pages/
    ├── index.astro
    ├── drills/
    │   ├── index.astro
    │   ├── past-form.astro
    │   └── particles.astro
    └── 404.astro
```

## Implementation Progress

See [PLAN.md](./PLAN.md) for architecture details and implementation checklist.

## Getting Started

```bash
bun install
bunx astro add react sitemap
bun add -D unocss @unocss/astro
bun run dev
```

Browse `http://localhost:3000`.

## Integrations Installed

- `@astrojs/react` — React islands
- `@astrojs/sitemap` — SEO
- `unocss` + `@unocss/astro` — atomic CSS
- `@astrojs/mdx` (optional) — lesson pages with rich content

## Deployment

- Subdomain: `japanese.gudoes.dev`
- Hosted as a separate Astro project
- DNS points to `gudoes.dev`
