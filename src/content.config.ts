import { defineCollection } from 'astro:content';
import { z } from 'zod';

const drillsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    level: z.enum(['N5', 'N4', 'N3']),
    type: z.enum(['conjugation', 'particles', 'negative', 'te-form']),
    questions: z.array(
      z.object({
        prompt: z.string(),
        romaji: z.string(),
        answer: z.string(),
        hint: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  drills: drillsCollection,
};
