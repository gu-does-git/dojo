# Dojo

Japanese grammar learning platform — interactive drills with instant feedback.

## Tech Stack

- **Framework**: Astro 6.3 (static-first with React islands)
- **Interactivity**: React 19 for drill session components
- **CSS**: Tailwind CSS v4
- **Fonts**: Inter + Noto Sans JP (Astro native font API)
- **Icons**: `@iconify/react` + `astro-icon` (Material Design Icons)
- **Input**: WanaKana (romaji → kana conversion)
- **Furigana**: react-furi
- **Confetti**: canvas-confetti
- **Deployment**: `japanese.gudoes.dev`

## Features

- Romaji → kana input conversion via WanaKana
- Furigana display with toggle (supports full sentences for particle drills)
- Reversed mode — swap prompt/answer to drill both directions
- Romaji hint toggle
- Streak tracking with milestone toasts
- Results screen: score card, stats, scrollable question history
- Confetti on perfect score
- Dark mode (system preference + toggle)
- Dynamic drill routing via content collections

## Drills

| Drill | Route | Level | Type |
|---|---|---|---|
| Past Form | `/drills/past-form` | N5 | conjugation |
| Particles | `/drills/particles` | N5 | particles |

## Project Structure

```
src/
├── content.config.ts           — Zod schemas for content collections
├── content/drills/
│   ├── past-form.json
│   └── particles.json
├── components/
│   ├── DrillSession.tsx        — main drill React island
│   ├── FuriganaText.tsx        — ruby/furigana renderer
│   ├── LoaderSVG.tsx           — hydration loader
│   ├── ScoreCard.tsx           — results score display
│   ├── StatsRow.tsx            — correct/incorrect/streak stats
│   ├── QuestionHistory.tsx     — scrollable answer review
│   └── Header.astro            — site header with dark mode toggle
├── layouts/
│   ├── BaseLayout.astro
│   └── DrillLayout.astro
└── pages/
    ├── index.astro             — landing page
    └── drills/
        ├── index.astro         — all drills grid
        └── [slug].astro        — dynamic drill session page
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

For particle drills, questions also include a `reading` field (hiragana sentence with `___` preserved) used to render per-segment furigana:

```json
{
  "prompt": "私___学生です。",
  "reading": "わたし___がくせいです。",
  "romaji": "Watashi ___ gakusei desu.",
  "answer": "は"
}
```

## Getting Started

```bash
bun install
bun run dev
```

Open `http://localhost:4321`.
