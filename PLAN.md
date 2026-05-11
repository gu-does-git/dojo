# Dojo — Implementation Plan

## Architecture

**Integrations**: Astro 6.3 + React islands + UnoCSS + Content Collections

**Design**: Modern SaaS, dark mode first. Indigo/purple accents. Inter + Noto Sans JP fonts.

**Scope**: Grammar drills only (past-form, particles). N5 level.

**Routing**:
```
/                    → Landing grid
/drills              → All drills index
/drills/past-form    → Past tense conjugation
/drills/particles    → Particle usage
```

---

## Implementation Checklist

- [ ] Add Astro integrations (React, UnoCSS, sitemap)
- [ ] Configure UnoCSS theme tokens (colors, typography)
- [ ] Set up Astro 6 font API (Inter + Noto Sans JP)
- [ ] Create base layouts (BaseLayout, DrillLayout)
- [ ] Set up Astro Content Collections + zod schemas
- [ ] Create drill data (past-form.json, particles.json)
- [ ] Build React drill components (ConjugationDrill, ParticleDrill)
- [ ] Create Astro pages (index, drills routes)
- [ ] Test dev server end-to-end
- [ ] Deploy to japanese.gudoes.dev

---

## File Structure (Target)

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
│       ├── ConjugationDrill.tsx
│       └── ParticleDrill.tsx
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

---

## Design System

**Colors** (CSS custom properties):
- Light: `--bg: #ffffff`, `--text: #0f0f13`
- Dark: `--bg: #0f0f13`, `--text: #e8e8f0`
- Accents: `--accent: #818cf8` (indigo), `--accent2: #a78bfa` (purple)
- Feedback: `--success: #4ade80`, `--error: #f87171`

**Typography**:
- `text-sm` (14px), `text-base` (16px), `text-xl` (20px), `text-3xl` (30px), `text-5xl` (48px)

---

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
      "hint": "Group 2 verb — drop る, add た"
    }
  ]
}
```
