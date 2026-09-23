import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import {
  defaultLanguage,
  entryLanguage,
  isPublished,
  videoCount,
  type Language,
} from '../i18n';

/**
 * Site chrome and the home page are single entries per language. If a
 * translation has not been written yet the entry still exists as a stub with
 * empty fields, so both getters fall back to the default language — the site
 * never renders an empty header or a blank landing page while an editor is
 * halfway through translating.
 */
function pick<T extends { data: { title: string } }>(
  localized: T | undefined,
  fallback: T | undefined,
  missingHint: string,
): T {
  if (localized && localized.data.title.trim() !== '') return localized;
  if (fallback) return fallback;
  if (localized) return localized;

  throw new Error(`Missing content entry: create ${missingHint}`);
}

export async function getSettings(
  lang: Language,
): Promise<CollectionEntry<'settings'>> {
  return pick(
    await getEntry('settings', `${lang}/settings`),
    await getEntry('settings', `${defaultLanguage}/settings`),
    `src/content/settings/${defaultLanguage}/settings.md`,
  );
}

export async function getHome(
  lang: Language,
): Promise<CollectionEntry<'home'>> {
  return pick(
    await getEntry('home', `${lang}/home`),
    await getEntry('home', `${defaultLanguage}/home`),
    `src/content/home/${defaultLanguage}/home.md`,
  );
}

/** Published entries of a collection in one language. */
export async function getPublished<
  C extends 'events' | 'articles' | 'series' | 'topics' | 'pages',
>(collection: C, lang: Language): Promise<CollectionEntry<C>[]> {
  return getCollection(
    collection,
    ({ id, data }: { id: string; data: { title: string; isDraft: boolean } }) =>
      entryLanguage(id) === lang && isPublished(data),
  );
}

export async function getTopics(lang: Language) {
  return (await getPublished('topics', lang)).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

export async function getSeries(lang: Language) {
  return (await getPublished('series', lang)).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/** Line above a series title: the editor's label, else the number of videos. */
export function seriesLabel(entry: CollectionEntry<'series'>, lang: Language): string {
  const { partsLabel, videos } = entry.data;
  if (partsLabel) return partsLabel;
  return videos.length > 0 ? videoCount(lang, videos.length) : '';
}

/** Articles, newest first; undated entries sort last. */
export async function getArticles(lang: Language) {
  return (await getPublished('articles', lang)).sort(
    (a, b) =>
      (b.data.publishDate?.getTime() ?? 0) -
      (a.data.publishDate?.getTime() ?? 0),
  );
}

/**
 * Articles that are parts of a series, in part order. Parts without a number
 * follow the numbered ones, oldest first.
 */
export async function getSeriesParts(lang: Language, seriesKey: string) {
  return (await getPublished('articles', lang))
    .filter((article) => article.data.series === seriesKey)
    .sort(
      (a, b) =>
        (a.data.seriesPart ?? Infinity) - (b.data.seriesPart ?? Infinity) ||
        (a.data.publishDate?.getTime() ?? 0) - (b.data.publishDate?.getTime() ?? 0),
    );
}

/** Events, soonest first. */
export async function getEvents(lang: Language) {
  return (await getPublished('events', lang)).sort(
    (a, b) => a.data.eventDate.getTime() - b.data.eventDate.getTime(),
  );
}

/** The time zone event dates and times are written in. */
export const siteTimeZone = 'Europe/Helsinki';

/** Calendar date (YYYY-MM-DD) of a content date, which is stored as UTC midnight. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's date in the site's time zone, as YYYY-MM-DD. */
export function today(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: siteTimeZone }).format(
    new Date(),
  );
}

/**
 * Whether an event is over. An event stays upcoming through its last day, so
 * it is still listed on the day it takes place. Decided at build time; the
 * deploy workflow rebuilds daily so the split stays current.
 */
export function isPastEvent(data: { eventDate: Date; endDate?: Date }): boolean {
  return isoDay(data.endDate ?? data.eventDate) < today();
}

/** Events that have not ended yet, soonest first. */
export async function getUpcomingEvents(lang: Language) {
  return (await getEvents(lang)).filter((event) => !isPastEvent(event.data));
}

/** Events that have ended, most recent first. */
export async function getPastEvents(lang: Language) {
  return (await getEvents(lang))
    .filter((event) => isPastEvent(event.data))
    .reverse();
}

export type EventEntry = CollectionEntry<'events'>;
