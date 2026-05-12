# Dojo — Feature & Improvement Suggestions

Grounded in codebase analysis (3 subagent deep-dives across UX, data model, styling/perf).
Grouped by impact. Each suggestion notes affected files and effort estimate.

---

## P0 — Bugs & Config Fixes (do first, everything builds on these)

### 1. Fix JetBrains Mono font conflict
Both Inter and JetBrains Mono map to `--font-body` in `astro.config.mjs:30-35`. Last-declared wins → body text renders in monospace. Split: JetBrains Mono → `--font-mono`, update `global.css` to use `var(--font-mono)` for code elements.

### 2. Fix sitemap — no `site:` URL set
`astro.config.mjs` uses `@astrojs/sitemap` but `defineConfig` has no `site:` property. Sitemap output is broken/empty. Add `site: "https://japanese.gudoes.dev"`.

### 3. Empty input submit → no-op
`DrillSession.tsx` submit handler doesn't guard against empty string. Pressing Enter or clicking "Check Answer" with blank input scores as incorrect. Add early return if `input.trim() === ''`.

### 4. Zero-question drill crash
If content JSON has empty `questions: []`, DrillSession crashes (no guard on `questions.length`). Add empty-state rendering: "No questions available" message.

---

## P1 — High-Impact Features

### 5. Spaced Repetition / Smart Review
The killer feature for retention. Store per-question accuracy in localStorage. On drill start, weight question order toward weak items. Low effort — just localStorage + shuffle weighting. No backend needed.

**Files:** `DrillSession.tsx` (shuffle logic, new `useReviewStore` hook), new `src/lib/reviewStore.ts`

### 6. Progress Persistence (localStorage)
Currently drills reset on page refresh. Persist: current question index, score, streak, answers to localStorage keyed by drill id. Resume where you left off.

**Files:** `DrillSession.tsx` (load/save effect), new `src/lib/progressStore.ts`

### 7. Multiple Choice Mode
Free-text input is hard for beginners. Add a mode toggle: type answers OR pick from 4 options. Schema already has `difficulty` field — use it to generate plausible distractors from other questions' answers.

**Files:** `content.config.ts` (add `mode` enum), `DrillSession.tsx` (new rendering branch for MCQ), new `src/lib/distractors.ts`

### 8. Accessibility Overhaul
Current state: no ARIA labels, no focus management, `lang="ja"` missing on Japanese text elements, some contrast ratios below 4.5:1 (muted text on dark bg), touch targets <44pt. This is a learning tool — accessibility matters.

**Fixes:**
- `BaseLayout.astro`: add `lang` attribute dynamically based on content
- `DrillSession.tsx`: ARIA live regions for score/feedback, focus input after feedback dismiss
- `global.css`: `@media (prefers-reduced-motion: reduce)` to disable shake/slide animations
- Review all contrast ratios — bump muted text to ≥4.5:1

---

## P2 — Engagement & Content

### 9. Daily Challenge / Streak System
"Complete 1 drill per day" → local streak counter with visual calendar. Pure localStorage. High engagement hook. Shows on homepage.

**Files:** new `src/components/DailyStreak.tsx`, `src/lib/dailyStore.ts`, `index.astro` (embed widget)

### 10. Grammar Explanation Cards
Each question has a `hint` field. Expand this: add a `grammarPoint` field to schema linking to a short explanation (which particle, why this conjugation, rule summary). Show as expandable card during feedback phase.

**Files:** `content.config.ts` (add `grammarPoint` to question schema), drill JSONs (populate), `DrillSession.tsx` (render during feedback)

### 11. Populate `reading` Field for Particle Drills
Schema supports it. Component renders it (`DrillSession.tsx:261-279`). Data doesn't have it. Per-segment furigana on particle sentences would significantly improve readability for beginners.

**Files:** `src/content/drills/particles.json` (add `reading` to all 50 questions)

### 12. More Drill Content
Current: 3 drills (past-form, te-form, particles), all N5. The schema supports `negative`, `te-form` types, N4/N3 levels. Add:
- N5: negative form, adjective conjugation, question words
- N4: potential form, conditional, passive
- N3: causative, honorifics

**Files:** new JSON files in `src/content/drills/`

### 13. Difficulty-Based Adaptive Mode
Schema already has per-question `difficulty` (N5–N1). Use it: start at N5, ramp up on correct streaks, drop down on wrong streaks. No schema changes needed.

**Files:** `DrillSession.tsx` (shuffle + adaptive ordering logic)

---

## P3 — Polish & Infra

### 14. 404 Page
No custom 404 exists. `src/pages/404.astro` with site branding and drill links. Trivial.

### 15. OG/Twitter Meta Tags
No social share preview. Add `og:title`, `og:description`, `og:image`, `twitter:card` to `BaseLayout.astro`. Use the accent color + kanji branding for the OG image.

### 16. PWA (Offline Support)
Fully static site — ideal PWA candidate. Add manifest + service worker. Users can install on home screen, use offline. Astro has `@vite-pwa/astro` integration.

**Files:** `astro.config.mjs` (add PWA integration), new `public/manifest.json`

### 17. Remove Dead Weight
- `Layout.astro` — orphaned starter template, not imported anywhere
- `Welcome.astro` — unused Astro demo component
- `UnoCSS` + `@unocss/astro` — in devDeps but not wired in config
- `astro-icon` integration — in config but no `.astro` file imports it (only `@iconify/react` is used)
- `astro.svg` + `background.svg` — likely unused Astro starter assets
- `@types/react` + `@types/react-dom` — should be `devDependencies`, not `dependencies`

### 18. Keyboard Shortcut Cheatsheet Modal
`?` key opens a modal listing all shortcuts (r, f, o, Enter, Tab). Current shortcuts are undocumented in the UI.

**Files:** new `src/components/ShortcutModal.tsx`, `DrillSession.tsx` (trigger on `?`)

### 19. Print Styles
`global.css` has no `@media print`. Add print-friendly styles: hide nav/toggles, show question-answer pairs linearly. Useful for teachers.

### 20. Per-Drill Timer
Track time per question and total. Show in results screen. Pure client state.

**Files:** `DrillSession.tsx` (add timer state, display in results phase)

---

## Summary Table

|#|Feature|Impact|Effort|Priority|
|---|---|---|---|---|
|1|Font conflict fix|Bug fix|Small|P0|
|2|Sitemap site URL|Bug fix|Trivial|P0|
|3|Empty input guard|Bug fix|Trivial|P0|
|4|Zero-question guard|Bug fix|Trivial|P0|
|5|Spaced repetition|High|Medium|P1|
|6|Progress persistence|High|Small|P1|
|7|Multiple choice|High|Medium|P1|
|8|Accessibility|High|Medium|P1|
|9|Daily challenge|High|Medium|P2|
|10|Grammar explanations|Medium|Small|P2|
|11|Populate reading field|Medium|Small|P2|
|12|More drill content|High|Manual|P2|
|13|Adaptive difficulty|Medium|Small|P2|
|14|404 page|Low|Trivial|P3|
|15|OG meta tags|Medium|Small|P3|
|16|PWA / offline|Medium|Medium|P3|
|17|Remove dead code|Low|Small|P3|
|18|Shortcut cheatsheet|Low|Small|P3|
|19|Print styles|Low|Trivial|P3|
|20|Per-drill timer|Low|Small|P3|

## Recommended Implementation Order

**Batch 1 (bugs):** #1 font fix + #2 sitemap + #3 empty input + #4 zero-question guard
**Batch 2 (engagement):** #6 persistence → #5 spaced repetition → #7 multiple choice
**Batch 3 (polish):** #8 accessibility + #11 reading field + #14 404 + #18 shortcut modal
**Batch 4 (content):** #10 grammar explanations → #12 more drills → #13 adaptive difficulty
**Batch 5 (infra):** #15 OG meta + #16 PWA + #17 dead code removal + #19 print styles
