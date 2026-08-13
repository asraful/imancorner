import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

// An entry's language and translation key are not frontmatter: both are
// derived from its path (src/content/<collection>/<language>/<key>.md) via
// entryLanguage()/entryKey() in src/i18n.
//
// Translatable text defaults to '' instead of being required, because the CMS
// writes one file per language as soon as an entry is created and omits the
// fields the editor left blank. A translation nobody has written yet therefore
// arrives as a stub with no title; isPublished() in src/i18n keeps those out of
// the site instead of failing the build.

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string().default(''),
    eventDate: z.coerce.date(),
    location: z.string().default(''),
    videoUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    isDraft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().default(''),
    description: z.string().optional(),
    showInNav: z.boolean().default(false),
    navOrder: z.number().default(0),
    isDraft: z.boolean().default(false),
  }),
});

export const collections = { events, pages };
