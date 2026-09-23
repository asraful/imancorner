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

/** Optional field the CMS may save as an empty string when left blank. */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional(),
  );
}

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm, e.g. 18:30');

/** A link written in the CMS: label plus a site-relative path or full URL. */
const link = z.object({
  label: z.string().default(''),
  url: z.string().default(''),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string().default(''),
    eventDate: z.coerce.date(),
    /** Last day of a multi-day event; the event counts as upcoming until then. */
    endDate: optional(z.coerce.date()),
    /** Display text, e.g. "After Maghrib". */
    time: z.string().default(''),
    /** Machine-readable start and end (HH:mm, Helsinki time) for calendars and search engines. */
    startTime: optional(hhmm),
    endTime: optional(hhmm),
    location: z.string().default(''),
    address: z.string().default(''),
    mapUrl: optional(z.url()),
    isOnline: z.boolean().default(false),
    registrationUrl: optional(z.url()),
    coverImage: optional(z.string()),
    category: z.string().default(''),
    videoUrl: optional(z.url()),
    tags: z.array(z.string()).default([]),
    isDraft: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().default(''),
    excerpt: z.string().default(''),
    /** Translation key of an entry in the `topics` collection, e.g. `quran`. */
    topic: z.string().default(''),
    minutes: z.number().default(0),
    /** Translation key of an entry in the `series` collection, e.g. `forty-hadith`. */
    series: z.string().default(''),
    /** Position within the series; parts are listed in this order. */
    seriesPart: optional(z.number().int().positive()),
    publishDate: z.coerce.date().optional(),
    coverImage: optional(z.string()),
    isDraft: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({
    title: z.string().default(''),
    /** Short count line shown above the title, e.g. "40 parts". */
    partsLabel: z.string().default(''),
    description: z.string().default(''),
    /** Translation key of an entry in the `topics` collection; lists the series on that topic page. */
    topic: z.string().default(''),
    /** The YouTube playlist the videos come from. */
    playlistUrl: optional(z.url()),
    /** Recorded lessons, in watching order. */
    videos: z
      .array(
        z.object({
          title: z.string(),
          url: z.url(),
          date: optional(z.coerce.date()),
          minutes: z.number().int().nonnegative().default(0),
          /** Language spoken: en, ar, or both. */
          language: z.enum(['en', 'ar', 'both']).default('en'),
        }),
      )
      .default([]),
    order: z.number().default(0),
    isDraft: z.boolean().default(false),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string().default(''),
    description: z.string().default(''),
    /** Name of one of the icons drawn by src/components/Icon.astro. */
    icon: z.string().default('book-open'),
    order: z.number().default(0),
    isDraft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().default(''),
    description: z.string().optional(),
    isDraft: z.boolean().default(false),
  }),
});

// Every visible string of the home page, so editors can rewrite the landing
// page without touching the templates. One entry per language: src/content/
// home/<language>/home.md.
const home = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/home' }),
  schema: z.object({
    title: z.string().default(''),
    hero: z
      .object({
        bismillah: z.string().default(''),
        headingLead: z.string().default(''),
        headingHighlight: z.string().default(''),
        intro: z.string().default(''),
        primaryCta: link.prefault({}),
        secondaryCta: link.prefault({}),
        image: z.string().default('/images/site/mecca-hero.jpg'),
        imageAlt: z.string().default(''),
      })
      .prefault({}),
    verse: z
      .object({
        label: z.string().default(''),
        arabic: z.string().default(''),
        translation: z.string().default(''),
        reference: z.string().default(''),
      })
      .prefault({}),
    topicsSection: z
      .object({
        eyebrow: z.string().default(''),
        heading: z.string().default(''),
      })
      .prefault({}),
    eventsSection: z
      .object({
        eyebrow: z.string().default(''),
        heading: z.string().default(''),
        ctaLabel: z.string().default(''),
      })
      .prefault({}),
    lessonsSection: z
      .object({
        eyebrow: z.string().default(''),
        heading: z.string().default(''),
      })
      .prefault({}),
    articlesSection: z
      .object({
        eyebrow: z.string().default(''),
        heading: z.string().default(''),
      })
      .prefault({}),
    hadith: z
      .object({
        eyebrow: z.string().default(''),
        arabic: z.string().default(''),
        translation: z.string().default(''),
        source: z.string().default(''),
      })
      .prefault({}),
    seriesSection: z
      .object({
        heading: z.string().default(''),
        intro: z.string().default(''),
      })
      .prefault({}),
    newsletter: z
      .object({
        heading: z.string().default(''),
        text: z.string().default(''),
        placeholder: z.string().default(''),
        buttonLabel: z.string().default(''),
        /** Form endpoint (Mailchimp, Buttondown, …). Empty = show a link instead. */
        actionUrl: z.string().default(''),
        fallbackUrl: z.string().default('/contact/'),
      })
      .prefault({}),
    isDraft: z.boolean().default(false),
  }),
});

// Header navigation, header call-to-action and footer, per language:
// src/content/settings/<language>/settings.md.
const settings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/settings' }),
  schema: z.object({
    title: z.string().default(''),
    siteName: z.string().default(''),
    siteKicker: z.string().default(''),
    tagline: z.string().default(''),
    nav: z.array(link).default([]),
    headerCta: link.prefault({}),
    footerIntro: z.string().default(''),
    footerArabic: z.string().default(''),
    footerColumns: z
      .array(
        z.object({
          title: z.string().default(''),
          links: z.array(link).default([]),
        }),
      )
      .default([]),
    footerNote: z.string().default(''),
    copyrightName: z.string().default(''),
    /** Cookie-free visitor statistics; nothing is loaded while both are empty. */
    analytics: z
      .object({
        /** GoatCounter site code: the "mysite" in mysite.goatcounter.com. */
        goatcounterCode: z
          .string()
          .regex(/^[a-z0-9-]*$/, 'Only the code, e.g. imancorner — not the full address')
          .default(''),
        /** Cloudflare Web Analytics site token. */
        cloudflareToken: z
          .string()
          .regex(/^[A-Za-z0-9]*$/, 'Paste only the token value')
          .default(''),
      })
      .prefault({}),
  }),
});

export const collections = {
  events,
  articles,
  series,
  topics,
  pages,
  home,
  settings,
};
