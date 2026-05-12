# Dojo — TODO

## Done

- [x] Astro 6 + React islands + Tailwind CSS v4 setup
- [x] Base layouts (BaseLayout, DrillLayout)
- [x] Astro native font API (Inter + Noto Sans JP)
- [x] Dark mode (system preference + toggle in header)
- [x] Landing page with drill category grid
- [x] Drills index page matching landing card style
- [x] Content collections + Zod schemas
- [x] Drill data: past-form.json, particles.json
- [x] Dynamic routing via `[slug].astro`
- [x] DrillSession React component
  - [x] WanaKana romaji → kana input binding
  - [x] Reversed mode (swap prompt/answer)
  - [x] Furigana toggle
  - [x] Romaji hint toggle
  - [x] Streak tracking + milestone toasts
  - [x] Confetti on perfect score
- [x] Furigana rendering (FuriganaText + react-furi)
  - [x] Per-segment furigana for particle sentences with `___`
  - [x] `reading` field in Zod schema + particles.json
- [x] Results screen: ScoreCard, StatsRow, QuestionHistory
- [x] Inline hint for fill-in-the-blank questions
- [x] MDI icons via @iconify/react across all components
- [x] Loader SVG with hydration handling
- [x] Husky + commitlint setup
- [x] Placeholder test for pre-commit hook

## Up Next

- [ ] Add more N5 drills (negative form, te-form)
- [ ] Add N4 drill content
- [ ] Keyboard shortcut cheatsheet / help modal
- [ ] Session history / local storage persistence
- [ ] 404 page
- [ ] Deploy to japanese.gudoes.dev
