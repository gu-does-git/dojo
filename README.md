# Dojo

<img src="https://raw.githubusercontent.com/gu-does-git/dojo/refs/heads/master/public/favicon.svg" alt="Dojo Logo" width="32" align="right">

Japanese grammar learning platform — interactive drills with instant feedback.

## Tech Stack

- **Framework**: Astro 6.3 (static-first with React islands)
- **Interactivity**: React 19 for drill session components
- **CSS**: Tailwind CSS v4 via @tailwindcss/vite, @theme design tokens
- **Fonts**: Newsreader (display), Inter + JetBrains Mono (body), Kiwi Maru (Japanese) — Astro font API
- **Icons**: `@iconify/react` (Material Design Icons)
- **Input**: WanaKana (romaji → kana conversion + IME binding)
- **Furigana**: react-furi (ruby annotations via useFuriPairs)
- **Confetti**: canvas-confetti
- **Husky 9**: commit-msg (commitlint + AI-attribution block), pre-commit (bun test)
- **commitlint**: @commitlint/config-conventional
- **Deployment**: `japanese.gudoes.dev`

## Features
- Romaji → kana input conversion via WanaKana (IME binding, works in reversed mode too)
- Furigana display with toggle (ruby annotations via react-furi)
- Reversed mode — swap prompt/answer to drill both directions (resets drill)
- Romaji hint toggle
- Keyboard shortcuts: `r`=reverse, `f`=furigana, `o`=romaji
- Streak tracking with milestone toasts (🔥3, ⚡5, 🏆10)
- Results screen: score card, stats, scrollable question history
- Confetti on perfect score
- Hydration loading state (spinner before React mount)
- **Dark-only warm-tone design** (#1a1816 bg, #5b6abf accent, #b8952f gold)
- Dynamic drill routing via content collections (getStaticPaths)
- Client-side filtering on drills page (by type, level, search) with URL query param sync
- Header navigation with back button on drill pages
- Pill-shaped toggle switches with sliding indicators

## Drills
| Drill | Route | Level | Type |
|---|---|---|---|
| Past Form | `/drills/past-form` | N5 | conjugation |
| Particles | `/drills/particles` | N5 | particles |
| て Form | `/drills/te-form` | N5 | conjugation |
## Project Structure
```
src/
├── content.config.ts              — Zod schemas for content collections
├── content/drills/
│   ├── past-form.json
│   ├── particles.json
│   └── te-form.json
├── components/
│   ├── DrillSession.tsx           — main drill React island (342 lines, 14 useState)
│   ├── FuriganaText.tsx           — ruby/furigana renderer via react-furi
│   ├── LoaderSVG.tsx              — hydration loading spinner
│   └── Header.astro               — site header with logo + nav
├── layouts/
│   ├── BaseLayout.astro           — HTML shell with SEO meta
│   ├── DrillLayout.astro          — header + main + footer wrapper
│   └── Layout.astro               — (orphaned starter template, unused)
├── styles/
│   └── global.css                 — Tailwind v4 @theme, resets, animations
└── pages/
    ├── index.astro                — landing page with stats
    └── drills/
        ├── index.astro            — drill listing with client-side filter
        └── [slug].astro           — dynamic drill session page
```

## Drill Data Format

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
      "answerRomaji": "tabeta",
      "difficulty": "N5",
      "hint": "Group 2 verb — drop る, add た"
    }
  ]
}
```

For particle drills, prompts use `___` as a blank placeholder for the answer. The schema also defines an optional `reading` field (per-segment hiragana for furigana rendering) — not yet populated in drill data.

## Getting Started
```bash
bun install    # install deps + husky hooks
bun run dev    # start dev server at http://localhost:4321
```
Open `http://localhost:4321`.
```bash
bun test       # run test suite (husky pre-commit hook)
```