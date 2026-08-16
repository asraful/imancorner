import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import {
  defaultLanguage,
  entryLanguage,
  isPublished,
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

/** Articles, newest first; undated entries sort last. */
export async function getArticles(lang: Language) {
  return (await getPublished('articles', lang)).sort(
    (a, b) =>
      (b.data.publishDate?.getTime() ?? 0) -
      (a.data.publishDate?.getTime() ?? 0),
  );
}

/** Events, soonest first. */
export async function getEvents(lang: Language) {
  return (await getPublished('events', lang)).sort(
    (a, b) => a.data.eventDate.getTime() - b.data.eventDate.getTime(),
  );
}
