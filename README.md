# Dojo

Japanese language learning drills framework.

## Overview

Dojo is a performance-focused platform for practicing Japanese language skills through interactive drills. Built with Astro.js for exceptional speed and a great learning UX.

## Tech Stack

- **Framework**: Astro.js (static-first with interactive islands)
- **Interactivity**: React/Solid.js islands for drill components
- **Deployment**: Hosted at `japanese.gudoes.dev`

## Why Astro?

Language learning apps thrive on performance. Astro's approach—static lesson pages + interactive exercise components—delivers:
- Fast initial load (instant for lesson content)
- Only hydrate interactive parts (form inputs, validation, feedback)
- Excellent mobile UX
- Natural fit for content-driven learning apps

## Project Structure

```
drills/
├── pastform/        (past tense conjugation exercises)
├── kanji/
├── particles/
└── ...
components/
src/
```

## First Drill

**Past Form Conjugation** — Interactive exercises for Japanese verb conjugation in past tense.

## Getting Started

```bash
bun install
bun run dev
```

## Deployment

- Subdomain: `japanese.gudoes.dev`
- Hosted as a separate Astro project
- DNS points to same hosting as main gudoes.dev
