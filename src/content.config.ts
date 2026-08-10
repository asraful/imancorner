import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
import { languageCodes } from './i18n';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    eventDate: z.coerce.date(),
    location: z.string(),
    videoUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    isDraft: z.boolean().default(false),
    language: z.enum(languageCodes),
    translationKey: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    showInNav: z.boolean().default(false),
    navOrder: z.number().default(0),
    isDraft: z.boolean().default(false),
    language: z.enum(languageCodes),
    translationKey: z.string(),
  }),
});

export const collections = { events, pages };
