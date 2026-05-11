# Dojo Implementation TODOs

## Setup & Configuration
- [x] Add Astro integrations (React, UnoCSS, sitemap)
- [x] Configure UnoCSS with theme tokens (colors, typography)
- [x] Set up Astro 6 font API (Inter + Noto Sans JP)

## Layouts & Structure
- [x] Create BaseLayout.astro (html shell, fonts, meta)
- [x] Create DrillLayout.astro (extends Base, adds progress nav)
- [x] Set up Astro Content Collections with zod schemas
- [x] Create Header component with dark mode toggle
- [x] Create demo landing page with drill grid

## Content & Data
- [ ] Create drill data files (past-form.json, particles.json)
- [ ] Populate past-form questions (N5 verbs)
- [ ] Populate particles questions (は/が/を/に usage)

## Components
- [ ] Build ConjugationDrill.tsx (React island)
- [ ] Build ParticleDrill.tsx (React island)
- [ ] Create DrillCard.astro (drill category card)
- [ ] Create DrillShell.astro (wrapper with progress bar)
- [ ] Create AnswerInput.astro (text input with validation)
- [ ] Create FeedbackBanner.astro (correct/wrong feedback)

## Pages
- [x] Create src/pages/index.astro (landing with drill grid)
- [ ] Create src/pages/drills/index.astro (all drills index)
- [ ] Create src/pages/drills/past-form.astro (past tense drill)
- [ ] Create src/pages/drills/particles.astro (particle drill)
- [ ] Create src/pages/404.astro

## Testing & Deployment
- [ ] Test dev server (`bun run dev`)
- [ ] Verify drill flow end-to-end (landing → drill → answer → feedback)
- [ ] Mobile responsiveness check
- [ ] Deploy to japanese.gudoes.dev
