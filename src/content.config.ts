import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const drillsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/drills' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    level: z.enum(['N5', 'N4', 'N3']),
    type: z.enum(['conjugation', 'particles', 'negative', 'te-form']),
    cheatsheetUrl: z.string().optional(),
    questions: z.array(
      z.object({
        prompt: z.string(),
        reading: z.string().optional(),
        romaji: z.string(),
        answer: z.string(),
        answerRomaji: z.string(),
        politeAnswer: z.string().optional(),
        politeAnswerRomaji: z.string().optional(),
        difficulty: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
        hint: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  drills: drillsCollection,
};
