import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { entryKey, entryLanguage, eventPath, isPublished } from '../../../i18n';
import { eventIcs } from '../../../lib/events';

/** Add-to-calendar file for each published event: /<lang>/events/<slug>.ics */
export const getStaticPaths = (async () => {
  const events = await getCollection('events', ({ data }) => isPublished(data));

  return events.map((entry) => ({
    params: { lang: entryLanguage(entry.id), slug: entryKey(entry.id) },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { entry } = props as { entry: CollectionEntry<'events'> };
  const lang = entryLanguage(entry.id);
  const key = entryKey(entry.id);
  const url = new URL(eventPath(lang, key), site).href;

  // First paragraph of the body, without markdown emphasis, as a summary.
  const summary = (entry.body ?? '')
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/[*_`#>]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();

  const body = eventIcs({
    // Same UID in every language so re-importing a translation updates the one event.
    uid: `${key}@${site?.host ?? 'imancorner.org'}`,
    url,
    title: entry.data.title,
    description: [entry.data.time, summary].filter(Boolean).join('\n\n'),
    data: entry.data,
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
